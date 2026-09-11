import os

content = """import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import {
  Menu, Search, Bell, User, ChevronDown, CloudRain, Cloud, Mountain,
  Waves, Droplets, AlertTriangle, Clock3, MapPin, Layers, Plus, Minus,
  LocateFixed, BarChart3, ShieldAlert, TrendingUp
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./Dashboard.css";

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_URL = "http://127.0.0.1:8000/api";

const DEMO_LOCATIONS = [
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Howrah", lat: 22.5958, lng: 88.3264 },
  { name: "Salt Lake", lat: 22.5874, lng: 88.4082 },
  { name: "Barasat", lat: 22.7161, lng: 88.4839 },
  { name: "Hooghly", lat: 22.9088, lng: 88.3967 },
  { name: "North 24 Parganas", lat: 22.7562, lng: 88.4239 },
  { name: "South 24 Parganas", lat: 22.1581, lng: 88.3303 },
];

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 10);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function Dashboard({ onNavigate }) {
  const [position, setPosition] = useState({ lat: 22.5726, lng: 88.3639 });
  const [locationInfo, setLocationInfo] = useState({ name: "Kolkata, West Bengal", district: "Kolkata", state: "West Bengal" });
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [terrainErr, setTerrainErr] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [apiOnline, setApiOnline] = useState(true);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      setApiOnline(res.ok);
    } catch {
      setApiOnline(false);
    }
  };

  const fetchData = async (lat, lng) => {
    setLoading(true);
    setTerrainErr("");
    try {
      // Location
      const locRes = await fetch(`${API_URL}/location?latitude=${lat}&longitude=${lng}`);
      let locName = "Unknown";
      if (locRes.ok) {
        const locData = await locRes.json();
        locName = locData.location_name || "Unknown";
        setLocationInfo({
          name: locName,
          district: locData.district || "—",
          state: locData.state || "—",
        });
      }

      // Features
      const featRes = await fetch(`${API_URL}/features?latitude=${lat}&longitude=${lng}`);
      const featData = await featRes.json();
      if (featData.error) setTerrainErr(featData.error);
      
      setWeather(featData);
      setDataSource(featData.data_source || "Unknown");

      // History
      const histRes = await fetch(`${API_URL}/rainfall/history?latitude=${lat}&longitude=${lng}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData.history || []);
      }

      // Prediction
      if (featData.terrain_available === false) {
        setPrediction(null);
      } else {
        const predBody = {
          latitude: lat,
          longitude: lng,
          elevation_m: featData.elevation_m,
          slope_degree: featData.slope_degree,
          rainfall_mm_hr: featData.rainfall_mm_hr || 0,
          rain_1h: featData.rain_1h || 0,
          rain_3h: featData.rain_3h || 0,
          rain_6h: featData.rain_6h || 0,
          rain_12h: featData.rain_12h || 0,
          rain_24h: featData.rain_24h || 0,
          rainfall_change: featData.rain_1h - (featData.rain_3h / 3.0)
        };

        const predRes = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(predBody)
        });

        if (predRes.ok) {
          const predData = await predRes.json();
          setPrediction(predData);
          // Save to localstorage history
          const savedHist = JSON.parse(localStorage.getItem("flood_history") || "[]");
          savedHist.unshift({
            timestamp: new Date().toLocaleString(),
            location: locName,
            probability: (predData.flood_probability * 100).toFixed(1) + "%",
            risk_level: predData.risk_level
          });
          localStorage.setItem("flood_history", JSON.stringify(savedHist.slice(0,10)));
        }
      }

      setLastUpdate(new Date());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchData(position.lat, position.lng);
  }, [position]);

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Location permission was denied. Please select a location on the map.")
      );
    } else {
      alert("Geolocation not supported by browser.");
    }
  };

  // Generate SVG path for history
  const getChartPath = () => {
    if (history.length === 0) return "";
    const maxRain = Math.max(...history.map(h => h.rainfall), 10);
    const w = 600, h = 250;
    const pts = history.map((item, i) => {
      const x = (w / (history.length - 1)) * i;
      const y = h - ((item.rainfall / maxRain) * (h - 20)); // leave top padding
      return `${x} ${y}`;
    });
    return `M0 250 L0 ${pts[0].split(' ')[1]} ` + pts.map(p => `L ${p}`).join(' ') + ` L600 250 Z`;
  };
  
  const trend = history.length >= 2 
    ? (history[history.length-1].rainfall > history[history.length-2].rainfall * 1.2 ? "Increasing" 
      : history[history.length-1].rainfall < history[history.length-2].rainfall * 0.8 ? "Decreasing" : "Stable")
    : "Stable";

  const numAlerts = prediction?.risk_level === "HIGH" ? 1 : 0;
  
  const savedHist = JSON.parse(localStorage.getItem("flood_history") || "[]");

  return (
    <div className="dashboard-page">
      <Sidebar activePage="dashboard" onNavigate={onNavigate}/>
      <div className="dashboard-main">
        <Navbar title="Dashboard" subtitle={`Overview of flood risk - Data Source: ${dataSource}`} />

        <div className="last-updated" style={{display: 'flex', justifyContent: 'space-between'}}>
          <span>Last Updated: {lastUpdate.toLocaleString()}</span>
          <span>{apiOnline ? "🟢 API Online" : "🔴 API Offline"}</span>
          <button onClick={() => fetchData(position.lat, position.lng)}>↻</button>
        </div>

        <main className="dashboard-content">
          <section className="top-stat-grid">
            <div className="stat-card flood-risk-card">
              <div className={`stat-icon ${prediction?.risk_level === 'HIGH' ? 'red' : prediction?.risk_level === 'MEDIUM' ? 'alert-red' : terrainErr ? 'gray' : 'green'}`}>
                <CloudRain size={27} />
              </div>
              <div className="stat-info">
                <h4>FLOOD RISK</h4>
                {terrainErr ? (
                  <strong style={{fontSize: '0.8rem', color: '#dc2626'}}>Prediction unavailable: terrain data is not available for this location.</strong>
                ) : (
                  <>
                    <strong className={`${prediction?.risk_level === 'HIGH' ? 'red-text' : ''}`}>
                      {prediction?.risk_level || "..."}
                    </strong>
                    <b>{prediction ? (prediction.flood_probability * 100).toFixed(1) + "%" : "..."}</b>
                    <span>Probability</span>
                  </>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <CloudRain size={27} />
              </div>
              <div className="stat-info">
                <h4>RAINFALL (24H)</h4>
                <strong className="blue-text">{weather ? weather.rain_24h.toFixed(1) : "..."}<small> mm</small></strong>
                <span className="increase">Trend: {trend}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Droplets size={27} />
              </div>
              <div className="stat-info">
                <h4>SOIL MOISTURE</h4>
                <strong>Data unavailable</strong>
                <span>(No sensor data)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon alert-red">
                <Bell size={27} />
              </div>
              <div className="stat-info">
                <h4>ACTIVE ALERTS</h4>
                <strong className="red-text">{numAlerts}</strong>
                <span>{numAlerts > 0 ? "High Priority" : "None"}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Clock3 size={27} />
              </div>
              <div className="stat-info">
                <h4>LAST UPDATE</h4>
                <strong>{lastUpdate.toLocaleTimeString()}</strong>
                <span>{lastUpdate.toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-middle-grid">
            <div className="dashboard-panel risk-map-panel" style={{display: 'flex', flexDirection: 'column'}}>
              <div className="panel-header">
                <h2>Flood Risk Map ({locationInfo.name.split(',')[0]})</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                   <select onChange={(e) => {
                       const loc = DEMO_LOCATIONS.find(l => l.name === e.target.value);
                       if(loc) setPosition({lat: loc.lat, lng: loc.lng});
                   }} style={{padding: '5px', borderRadius: '4px'}}>
                      <option value="">Select Demo Location...</option>
                      {DEMO_LOCATIONS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                   </select>
                   <button onClick={useCurrentLocation} style={{padding: '5px 10px', borderRadius: '4px', background: 'var(--primary-light)', color: 'white', border: 'none', cursor: 'pointer'}}>Use My Location</button>
                </div>
              </div>
              
              <div style={{flex: 1, position: 'relative', minHeight: '400px', borderRadius: '8px', overflow: 'hidden', marginTop: '10px'}}>
                <MapContainer center={[position.lat, position.lng]} zoom={10} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <div style={{padding: '10px', background: '#f8fafc', marginTop: '10px', borderRadius: '4px'}}>
                 <strong>Current Location:</strong> {locationInfo.name} ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})
                 <br />
                 {terrainErr ? <span style={{color: 'red'}}>{terrainErr} (Elevation/Slope Unavailable)</span> : <span>Elevation: {weather?.elevation_m?.toFixed(2)}m, Slope: {weather?.slope_degree?.toFixed(2)}°</span>}
              </div>
            </div>

            <div className="dashboard-panel rainfall-panel">
              <div className="panel-header">
                <h2>Rainfall Trend ({locationInfo.name.split(',')[0]})</h2>
              </div>
              <div className="chart-area" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', height: '100%'}}>
                {history.length > 0 ? (
                  <svg viewBox="0 0 600 250" preserveAspectRatio="none" style={{width: '100%', height: '250px'}}>
                    <defs>
                      <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b78df" stopOpacity="0.30"/>
                        <stop offset="100%" stopColor="#2b78df" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={getChartPath()} fill="url(#rainFill)" stroke="#2b78df" strokeWidth="2" />
                  </svg>
                ) : <p>Loading history...</p>}
                
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#64748b'}}>
                  {history.map((h, i) => <span key={i}>{h.date.substring(5)}</span>)}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-grid">
            <div className="dashboard-panel">
              <div className="panel-header">
                <h2>Recent Alerts</h2>
              </div>
              <div className="alerts-list">
                {numAlerts > 0 ? (
                  <div className="alert-item high-alert">
                    <div className="alert-icon"><ShieldAlert size={20} /></div>
                    <div className="alert-content">
                      <h5>HIGH FLOOD RISK</h5>
                      <p>{locationInfo.name} - Probability: {(prediction?.flood_probability * 100).toFixed(1)}%</p>
                      <span>Just now</span>
                    </div>
                  </div>
                ) : (
                  <p style={{padding: '20px', color: '#666'}}>No active flood alerts.</p>
                )}
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h2>Selected Location Risk</h2>
              </div>
              <div className="locations-table-container">
                <table className="locations-table">
                  <thead>
                    <tr>
                      <th>LOCATION</th>
                      <th>PROBABILITY</th>
                      <th>RISK LEVEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>{locationInfo.name}</strong>
                      </td>
                      <td>
                        {prediction ? (prediction.flood_probability * 100).toFixed(1) + "%" : "..."}
                      </td>
                      <td>
                        <span className={`risk-badge ${prediction?.risk_level === 'HIGH' ? 'high' : prediction?.risk_level === 'MEDIUM' ? 'moderate' : terrainErr ? 'gray' : 'low'}`}>
                          {prediction?.risk_level || (terrainErr ? "UNAVAILABLE" : "...")}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          <section className="dashboard-bottom-grid" style={{marginTop: '20px'}}>
             <div className="dashboard-panel" style={{gridColumn: '1 / -1'}}>
               <div className="panel-header">
                  <h2>Risk Trend (Prediction History)</h2>
               </div>
               <div className="locations-table-container">
                 {savedHist.length > 0 ? (
                   <table className="locations-table">
                     <thead>
                       <tr>
                         <th>TIME</th>
                         <th>LOCATION</th>
                         <th>PROBABILITY</th>
                         <th>RISK</th>
                       </tr>
                     </thead>
                     <tbody>
                       {savedHist.map((h, i) => (
                         <tr key={i}>
                           <td>{h.timestamp}</td>
                           <td>{h.location}</td>
                           <td>{h.probability}</td>
                           <td><span className={`risk-badge ${h.risk_level === 'HIGH' ? 'high' : h.risk_level === 'MEDIUM' ? 'moderate' : 'low'}`}>{h.risk_level}</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : <p style={{padding: '20px'}}>Not enough prediction history yet.</p>}
               </div>
             </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
"""

with open("react-frontend/src/pages/Dashboards/Dashboard/Dashboard.jsx", "w") as f:
    f.write(content)

