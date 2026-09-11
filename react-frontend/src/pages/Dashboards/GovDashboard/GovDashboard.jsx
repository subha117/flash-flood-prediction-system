import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Navbar from '../../../components/Navbar/Navbar';
import { AuthContext } from '../../../context/AuthContext';
import { LocationContext } from '../../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API = 'http://127.0.0.1:8000/api';

const riskColor = (level) => ({ CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#facc15', LOW: '#16a34a' }[level] || '#64748b');

export default function GovDashboard({ onNavigate, onHome }) {
  const { user, token } = useContext(AuthContext);
  const { location, weather, prediction } = useContext(LocationContext);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API}/alerts`).then(r => r.json()).then(setAlerts).catch(() => {});
      fetch(`${API}/predictions/history`).then(r => r.json()).then(setPredictions).catch(() => {});
    };
    
    // Seed real-looking data once
    if (!localStorage.getItem('seeded_predictions_100')) {
      fetch(`${API}/seed_dummy`).then(() => {
        localStorage.setItem('seeded_predictions_100', 'true');
        fetchData();
      }).catch(fetchData);
    } else {
      fetchData(); // Initial fetch
    }
    
    // Live update every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) { setBroadcastStatus('Please enter a message.'); return; }
    setBroadcastStatus('Broadcasting...');
    
    try {
      const response = await fetch(`${API}/alerts/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: broadcastMsg,
          location_name: location?.name || 'All Regions',
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          risk_level: prediction?.risk_level || 'CRITICAL'
        })
      });
      
      if (!response.ok) throw new Error('Broadcast failed');
      
      const newAlert = await response.json();
      setAlerts(prev => [newAlert, ...prev]);
      
      setBroadcastStatus(`✅ Alert broadcasted: "${broadcastMsg}"`);
      setBroadcastMsg('');
    } catch (err) {
      console.error(err);
      setBroadcastStatus('❌ Failed to broadcast alert.');
    }
  };

  const navItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'alerts', label: `🔔 Flood Alerts (${alerts.length})` },
    { id: 'map', label: '🗺 Risk Map' },
    { id: 'predictions', label: '🤖 Predictions' },
    { id: 'broadcast', label: '📢 Broadcast Alert' },
  ];

  const cardStyle = { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' };

  const criticalAlerts = alerts.filter(a => ['CRITICAL', 'HIGH'].includes(a.risk_level));

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar activePage="gov" onNavigate={onNavigate} onHome={onHome} />
      <div style={{ marginLeft: '248px', width: 'calc(100% - 248px)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar onNavigate={onNavigate} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left nav */}
          <nav style={{ width: '200px', background: '#1e3a5f', padding: '16px 0', flexShrink: 0 }}>
            <div style={{ padding: '0 16px 16px', color: '#93c5fd', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>GOV PANEL</div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: activeSection === item.id ? '#2563eb' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

            {activeSection === 'overview' && (
              <>
                <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Regional Flood Risk Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ ...cardStyle, borderTop: '4px solid #dc2626' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Alerts</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{alerts.length}</div>
                  </div>
                  <div style={{ ...cardStyle, borderTop: '4px solid #f97316' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Critical / High</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316' }}>{criticalAlerts.length}</div>
                  </div>
                  <div style={{ ...cardStyle, borderTop: '4px solid #2563eb' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Predictions Today</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>{predictions.length}</div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <h3 style={{ marginBottom: '12px' }}>Current Monitored Location</h3>
                  <p><strong>Location:</strong> {location?.name || 'Kolkata, West Bengal'}</p>
                  <p><strong>Coordinates:</strong> {location?.latitude?.toFixed(4)}°N, {location?.longitude?.toFixed(4)}°E</p>
                  {prediction && <>
                    <p><strong>Flood Risk:</strong> <span style={{ color: riskColor(prediction.risk_level), fontWeight: 700 }}>{prediction.risk_level}</span></p>
                    <p><strong>Probability:</strong> {(prediction.flood_probability * 100).toFixed(1)}%</p>
                  </>}
                  {weather && <>
                    <p><strong>Rainfall 24H:</strong> {weather.rain_24h?.toFixed(1)} mm</p>
                    <p><strong>Temperature:</strong> {weather.temperature?.toFixed(1)}°C</p>
                  </>}
                </div>
              </>
            )}

            {activeSection === 'alerts' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Active Flood Alerts</h2>
                {alerts.length === 0 ? (
                  <div style={cardStyle}><p style={{ color: '#64748b' }}>✅ No active alerts.</p></div>
                ) : alerts.map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderLeft: `5px solid ${riskColor(a.risk_level)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{a.location_name}</strong> &nbsp;
                        <span style={{ background: riskColor(a.risk_level), color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{a.risk_level}</span>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>{a.reason}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(a.timestamp).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: riskColor(a.risk_level) }}>
                        {(a.probability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeSection === 'map' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Live Risk Map</h2>
                <div style={{ ...cardStyle, height: '500px', padding: 0, overflow: 'hidden' }}>
                  <MapContainer center={[location?.latitude || 22.5726, location?.longitude || 88.3639]} zoom={8} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {alerts.map(a => (
                      <Marker key={a.id} position={[a.latitude, a.longitude]}>
                        <Popup>
                          <strong>{a.location_name}</strong><br />
                          Risk: {a.risk_level}<br />
                          Probability: {(a.probability * 100).toFixed(1)}%
                        </Popup>
                      </Marker>
                    ))}
                    {location && (
                      <Marker position={[location.latitude, location.longitude]}>
                        <Popup><strong>Monitored: {location.name}</strong></Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </>
            )}

            {activeSection === 'predictions' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Prediction History</h2>
                <div style={cardStyle}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Risk Level</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Probability</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Rainfall 24H</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                    </tr></thead>
                    <tbody>
                      {predictions.map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px' }}>{p.location_name}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ background: riskColor(p.risk_level), color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{p.risk_level}</span>
                          </td>
                          <td style={{ padding: '10px' }}>{(p.flood_probability * 100).toFixed(1)}%</td>
                          <td style={{ padding: '10px' }}>{p.rain_24h?.toFixed(1)} mm</td>
                          <td style={{ padding: '10px', fontSize: '0.8rem', color: '#64748b' }}>{new Date(p.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === 'broadcast' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Broadcast Emergency Alert</h2>
                <div style={cardStyle}>
                  <p style={{ color: '#64748b', marginBottom: '16px' }}>
                    Issue an emergency alert message to the public for the current region.
                  </p>
                  {broadcastStatus && (
                    <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', color: '#166534' }}>
                      {broadcastStatus}
                    </div>
                  )}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Alert Message</label>
                    <textarea
                      value={broadcastMsg}
                      onChange={e => setBroadcastMsg(e.target.value)}
                      placeholder="Enter emergency alert message for public broadcast..."
                      style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 600 }}>Region:</label>
                    <span style={{ marginLeft: '8px', color: '#2563eb' }}>{location?.state || 'West Bengal'} — {location?.district || 'All Districts'}</span>
                  </div>
                  {prediction && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                      ⚠️ Current ML risk for {location?.name}: <strong style={{ color: riskColor(prediction.risk_level) }}>{prediction.risk_level}</strong> ({(prediction.flood_probability * 100).toFixed(1)}%)
                    </div>
                  )}
                  <button onClick={handleBroadcast}
                    style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                    📢 Broadcast Emergency Alert
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
