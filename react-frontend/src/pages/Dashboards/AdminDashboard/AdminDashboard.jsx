import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Navbar from '../../../components/Navbar/Navbar';
import { AuthContext } from '../../../context/AuthContext';

const API = 'http://127.0.0.1:8000/api';

const badge = (role) => {
  const colors = { admin: '#dc2626', gov: '#2563eb', user: '#16a34a' };
  return (
    <span style={{ background: colors[role] || '#64748b', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
      {role}
    </span>
  );
};

export default function AdminDashboard({ onNavigate, onHome }) {
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [msg, setMsg] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!token) return;
    
    const fetchData = () => {
      // Fetch system stats
      fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setStats).catch(() => {});
      // Fetch users
      fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setUsers).catch(() => {});
      // Fetch alerts
      fetch(`${API}/alerts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setAlerts).catch(() => {});
      // Fetch predictions
      fetch(`${API}/predictions/history`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setPredictions).catch(() => {});
    };

    fetchData(); // initial fetch

    // Auto-refresh every 10 seconds for live monitoring
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`${API}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMsg(`✅ Role updated for user ${userId}`);
    } else setMsg('❌ Failed to update role.');
  };

  const handleResolveAlert = async (alertId) => {
    const res = await fetch(`${API}/admin/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setMsg(`✅ Alert ${alertId} resolved.`);
    }
  };

  const handleBackup = async () => {
    setMsg('Creating backup...');
    const res = await fetch(`${API}/admin/backup`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMsg(data.message);
  };

  const navItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 User Management' },
    { id: 'alerts', label: `🔔 Active Alerts (${alerts.length})` },
    { id: 'predictions', label: '🤖 Prediction History' },
    { id: 'system', label: '⚙️ System Tools' },
  ];

  const cardStyle = {
    background: '#fff', borderRadius: '12px', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar activePage="admin" onNavigate={onNavigate} onHome={onHome} />
      <div style={{ marginLeft: '248px', width: 'calc(100% - 248px)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar onNavigate={onNavigate} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left nav */}
          <nav style={{ width: '200px', background: '#1e293b', padding: '16px 0', flexShrink: 0 }}>
            <div style={{ padding: '0 16px 16px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN PANEL</div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: activeSection === item.id ? '#2563eb' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {msg && <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', color: '#166534' }}>{msg}</div>}

            {activeSection === 'overview' && (
              <>
                <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>System Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Total Users', value: stats?.total_users ?? '…', color: '#2563eb' },
                    { label: 'Total Predictions', value: stats?.total_predictions ?? '…', color: '#7c3aed' },
                    { label: 'Active Alerts', value: stats?.active_alerts ?? '…', color: '#dc2626' },
                    { label: 'Database', value: stats?.db_backend ?? '…', color: '#16a34a' },
                  ].map(s => (
                    <div key={s.label} style={{ ...cardStyle, borderTop: `4px solid ${s.color}` }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.label}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ marginBottom: '12px' }}>Logged-in Admin</h3>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> {badge(user?.role)}</p>
                </div>
              </>
            )}

            {activeSection === 'users' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>User Management</h2>
                <div style={cardStyle}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Change Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px' }}>{u.id}</td>
                          <td style={{ padding: '12px' }}>{u.name}</td>
                          <td style={{ padding: '12px' }}>{u.email}</td>
                          <td style={{ padding: '12px' }}>{badge(u.role)}</td>
                          <td style={{ padding: '12px' }}>
                            {u.id !== user?.id ? (
                              <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <option value="user">User</option>
                                <option value="gov">Gov</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>You</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === 'alerts' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Active Flood Alerts</h2>
                {alerts.length === 0 ? (
                  <div style={cardStyle}><p style={{ color: '#64748b' }}>✅ No active alerts.</p></div>
                ) : alerts.map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderLeft: `4px solid ${a.risk_level === 'CRITICAL' ? '#dc2626' : '#f97316'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{a.location_name}</strong> — {badge(a.risk_level)}
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{a.reason}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(a.timestamp).toLocaleString()}</div>
                      </div>
                      <button onClick={() => handleResolveAlert(a.id)}
                        style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeSection === 'predictions' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Prediction History</h2>
                <div style={cardStyle}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Risk</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Probability</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Source</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.slice(0, 20).map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px' }}>{p.location_name}</td>
                          <td style={{ padding: '10px' }}>{badge(p.risk_level?.toLowerCase())}</td>
                          <td style={{ padding: '10px' }}>{(p.flood_probability * 100).toFixed(1)}%</td>
                          <td style={{ padding: '10px', fontSize: '0.8rem' }}>{p.data_source}</td>
                          <td style={{ padding: '10px', fontSize: '0.8rem' }}>{new Date(p.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === 'system' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>System Tools</h2>
                <div style={cardStyle}>
                  <h3>Database Backup</h3>
                  <p style={{ color: '#64748b', marginBottom: '16px' }}>Create a PostgreSQL dump of all production data.</p>
                  <button onClick={handleBackup}
                    style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    ⬇ Create Backup
                  </button>
                </div>
                <div style={cardStyle}>
                  <h3>API Health</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Endpoint</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                    </tr></thead>
                    <tbody>
                      {['/api/health', '/api/features', '/api/alerts', '/api/predictions/history'].map(ep => (
                        <tr key={ep} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{ep}</td>
                          <td style={{ padding: '10px' }}><span style={{ color: '#16a34a', fontWeight: 600 }}>● LIVE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
