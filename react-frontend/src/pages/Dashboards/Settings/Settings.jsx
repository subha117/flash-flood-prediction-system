import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Navbar from '../../../components/Navbar/Navbar';
import { AuthContext } from '../../../context/AuthContext';
import './Settings.css';

const API = 'http://127.0.0.1:8000/api';

// Map sidebar URL ids → display tab names
const TAB_MAP = {
  'profile': 'Profile',
  'preferences': 'Preferences',
  'notifications': 'Notifications',
  'data-units': 'Data & Units',
  'security': 'Security',
  'access-roles': 'Access & Roles',
  'api-integrations': 'API & Integrations',
  'activity-log': 'Activity Log',
  'backup-restore': 'Backup & Restore',
  'about': 'About',
};

const tabs = Object.values(TAB_MAP);

// ─── Profile ────────────────────────────────────────────────────────────────
const ProfileTab = ({ user, token, setUser }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', ok: true });
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) { 
        setMsg({ text: 'Profile updated successfully!', ok: true }); 
        setUser(data);
      } else {
        setMsg({ text: data.detail || 'Failed to update profile.', ok: false });
      }
    } catch { setMsg({ text: 'Network error. Could not connect to server.', ok: false }); }
    finally { setSaving(false); }
  };

  return (
    <div className="tab-pane">
      <h3>Profile Information</h3>
      <p className="hint" style={{marginBottom: '16px'}}>Update your account details below.</p>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <form onSubmit={handleSave}>
        <div className="form-group"><label>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required disabled={saving} />
        </div>
        <div className="form-group"><label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={saving} />
        </div>
        <div className="form-group"><label>Role</label>
          <input type="text" value={user?.role?.toUpperCase() || ''} disabled className="input-disabled" />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Roles are assigned by administrators and cannot be changed here.</span>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// ─── Preferences ────────────────────────────────────────────────────────────
const PreferencesTab = ({ token, settings, setSettings }) => {
  const [theme, setTheme] = useState(settings?.theme || 'light');
  const [defaultLoc, setDefaultLoc] = useState(settings?.default_location || 'Kolkata');
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(settings?.theme || 'light');
    setDefaultLoc(settings?.default_location || 'Kolkata');
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', ok: true });
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme, default_location: defaultLoc }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setMsg({ text: 'Preferences saved successfully!', ok: true });
      } else {
        setMsg({ text: 'Failed to save preferences.', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error.', ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Preferences</h3>
      <p className="hint" style={{marginBottom: '16px'}}>Customize your dashboard appearance and default behavior.</p>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <div className="form-group"><label>Theme</label>
        <select value={theme} onChange={e => setTheme(e.target.value)} disabled={saving}>
          <option value="light">Light</option>
          <option value="dark">Dark (Coming Soon)</option>
        </select>
      </div>
      <div className="form-group"><label>Default Location</label>
        <input type="text" value={defaultLoc} onChange={e => setDefaultLoc(e.target.value)} disabled={saving} placeholder="e.g. Kolkata, India" />
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

// ─── Notifications ───────────────────────────────────────────────────────────
const NotificationsTab = ({ token, settings, setSettings }) => {
  const [enabled, setEnabled] = useState(settings?.notifications_enabled ?? true);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(settings?.notifications_enabled ?? true);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', ok: true });
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notifications_enabled: enabled }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setMsg({ text: 'Notification settings saved!', ok: true });
      } else {
        setMsg({ text: 'Failed to save notifications.', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error.', ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Notification Settings</h3>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <div className="form-group toggle-group">
        <label>Enable Flood Alerts</label>
        <label className="toggle">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} disabled={saving} />
          <span className="slider"></span>
        </label>
      </div>
      <p className="hint">When enabled, you will receive real-time flood risk alerts for monitored locations.</p>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

// ─── Data & Units ────────────────────────────────────────────────────────────
const DataUnitsTab = ({ token, settings, setSettings }) => {
  const [units, setUnits] = useState(settings?.units || 'metric');
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUnits(settings?.units || 'metric');
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', ok: true });
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ units }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setMsg({ text: 'Units saved successfully!', ok: true });
      } else {
        setMsg({ text: 'Failed to save units.', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error.', ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Data & Units</h3>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <div className="form-group"><label>Measurement System</label>
        <select value={units} onChange={e => setUnits(e.target.value)} disabled={saving}>
          <option value="metric">Metric — mm, °C, metres</option>
          <option value="imperial">Imperial — inches, °F, feet (Coming Soon)</option>
        </select>
      </div>
      <div className="info-box">
        <strong>Active Data Sources:</strong>
        <ul>
          <li>🌦 Weather: Open-Meteo (live)</li>
          <li>🗻 Terrain: Local DEM / Open-Meteo Elevation API</li>
          <li>🤖 ML Model: Random Forest (9 features)</li>
          <li>🗺 Geocoding: Nominatim</li>
        </ul>
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

// ─── Security ────────────────────────────────────────────────────────────────
const SecurityTab = ({ token }) => {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    if (newPwd !== confirm) { setMsg({ text: 'Passwords do not match.', ok: false }); return; }
    if (newPwd.length < 8) { setMsg({ text: 'Password must be at least 8 characters.', ok: false }); return; }
    
    setSaving(true);
    setMsg({ text: '', ok: true });
    
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: newPwd }),
      });
      const data = await res.json();
      if (res.ok) { 
        setMsg({ text: 'Password changed successfully!', ok: true }); 
        setCurrent(''); setNewPwd(''); setConfirm(''); 
      } else {
        setMsg({ text: data.detail || 'Failed to change password.', ok: false });
      }
    } catch { 
      setMsg({ text: 'Network error. Could not connect to server.', ok: false }); 
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Security</h3>
      <p className="hint" style={{marginBottom: '16px'}}>Update your account password securely.</p>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <form onSubmit={handleChange}>
        <div className="form-group"><label>Current Password</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required disabled={saving} />
        </div>
        <div className="form-group"><label>New Password</label>
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required disabled={saving} />
        </div>
        <div className="form-group"><label>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required disabled={saving} />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

// ─── Access & Roles ──────────────────────────────────────────────────────────
const AccessRolesTab = ({ token, user }) => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUsers(d); setLoading(false); })
      .catch(() => { setMsg({ text: 'Failed to load users', ok: false }); setLoading(false); });
  }, [token, user]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setMsg({ text: '', ok: true });
    try {
      const res = await fetch(`${API}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setMsg({ text: 'Role updated successfully!', ok: true });
      } else {
        const data = await res.json();
        setMsg({ text: data.detail || 'Failed to update role.', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error.', ok: false });
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.role !== 'admin') return (
    <div className="tab-pane">
      <h3>Access & Roles</h3>
      <div className="alert-error" style={{marginTop: '16px'}}>
        ⛔ <strong>Unauthorized:</strong> Administrator access is required to view and manage roles. Your current role is <strong>{user?.role?.toUpperCase()}</strong>.
      </div>
    </div>
  );

  return (
    <div className="tab-pane">
      <h3>Access & Roles</h3>
      <p className="hint" style={{marginBottom: '16px'}}>Manage user permissions and platform access. Only administrators can perform these actions.</p>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      
      {loading ? (
        <div style={{ padding: '20px', color: '#64748b' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ padding: '20px', color: '#64748b' }}>No users found.</div>
      ) : (
        <table className="settings-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role?.toUpperCase()}</span></td>
                <td>
                  {u.id !== user?.id ? (
                    <select 
                      value={u.role} 
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                    >
                      <option value="user">User</option>
                      <option value="gov">Gov</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cannot change own role</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── API & Integrations ──────────────────────────────────────────────────────
const APIIntegrationsTab = () => {
  const [health, setHealth] = useState({});
  const [checking, setChecking] = useState(false);

  const providers = [
    { name: 'FastAPI Backend', url: `${API}/health`, label: 'System Health' },
    { name: 'Open-Meteo Weather', url: 'https://api.open-meteo.com/v1/forecast?latitude=22.57&longitude=88.36&current=temperature_2m', label: 'Weather + Elevation' },
    { name: 'Nominatim Geocoding', url: 'https://nominatim.openstreetmap.org/reverse?lat=22.57&lon=88.36&format=json', label: 'Geocoding' },
  ];

  const checkAll = async () => {
    setChecking(true);
    const results = {};
    await Promise.all(providers.map(async (p) => {
      try {
        const start = Date.now();
        const res = await fetch(p.url, { signal: AbortSignal.timeout(5000) });
        results[p.name] = { ok: res.ok, ms: Date.now() - start };
      } catch {
        results[p.name] = { ok: false, ms: null };
      }
    }));
    setHealth(results);
    setChecking(false);
  };

  useEffect(() => { checkAll(); }, []);

  return (
    <div className="tab-pane">
      <h3>API & Integrations</h3>
      <div className="info-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0 }}>Live Provider Status</h4>
          <button className="btn-primary" onClick={checkAll} disabled={checking} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            {checking ? 'Checking…' : '↻ Refresh'}
          </button>
        </div>
        <table className="settings-table">
          <thead><tr><th>Provider</th><th>Purpose</th><th>Status</th><th>Latency</th><th>Auth</th></tr></thead>
          <tbody>
            {providers.map(p => {
              const h = health[p.name];
              return (
                <tr key={p.name}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.label}</td>
                  <td>
                    {!h ? <span style={{ color: '#94a3b8' }}>—</span>
                      : h.ok
                        ? <span style={{ color: '#16a34a', fontWeight: 600 }}>● ONLINE</span>
                        : <span style={{ color: '#dc2626', fontWeight: 600 }}>● OFFLINE</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{h?.ms != null ? `${h.ms}ms` : '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {p.name === 'FastAPI Backend' ? 'JWT Bearer' : 'No key required'}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td><strong>Local DEM</strong></td>
              <td>Terrain — Uttarakhand</td>
              <td><span style={{ color: '#2563eb', fontWeight: 600 }}>● LOCAL FILE</span></td>
              <td style={{ fontSize: '0.8rem', color: '#64748b' }}>~0ms</td>
              <td style={{ fontSize: '0.8rem', color: '#64748b' }}>File-based</td>
            </tr>
            <tr>
              <td><strong>Random Forest ML</strong></td>
              <td>Flood Prediction (9 features)</td>
              <td><span style={{ color: '#16a34a', fontWeight: 600 }}>● LOADED</span></td>
              <td style={{ fontSize: '0.8rem', color: '#64748b' }}>~1ms</td>
              <td style={{ fontSize: '0.8rem', color: '#64748b' }}>Internal model</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="hint">No API secrets are exposed in this panel. All credentials are stored server-side in <code>.env</code>.</p>
    </div>
  );
};



// ─── Activity Log ────────────────────────────────────────────────────────────
const ActivityLogTab = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/activity`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setLogs(d); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="tab-pane">
      <h3>Activity Log</h3>
      {loading ? <p>Loading…</p> : logs.length === 0 ? (
        <p className="hint">No activity recorded yet. Activity is logged when you update settings, change passwords, or make predictions.</p>
      ) : (
        <table className="settings-table">
          <thead><tr><th>Action</th><th>Details</th><th>Time</th></tr></thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.details || '—'}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── Backup & Restore ────────────────────────────────────────────────────────
const BackupRestoreTab = ({ token, user }) => {
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState('');

  const handleBackup = async () => {
    setLoading('backup');
    try {
      const res = await fetch(`${API}/admin/backup`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMsg({ text: data.message, ok: res.ok });
    } catch { setMsg({ text: 'Backup failed.', ok: false }); }
    setLoading('');
  };

  if (user?.role !== 'admin') return (
    <div className="tab-pane"><div className="alert-error">⛔ Admin access required.</div></div>
  );

  return (
    <div className="tab-pane">
      <h3>Backup & Restore</h3>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <div className="form-group">
        <button className="btn-primary" onClick={handleBackup} disabled={loading === 'backup'}>
          {loading === 'backup' ? 'Creating backup…' : '⬇ Create Database Backup'}
        </button>
        <p className="hint">Creates a full PostgreSQL dump of the flashflood database.</p>
      </div>
    </div>
  );
};

// ─── About ───────────────────────────────────────────────────────────────────
const AboutTab = () => (
  <div className="tab-pane">
    <h3>About the System</h3>
    <div className="info-box">
      <table className="settings-table">
        <tbody>
          <tr><td><strong>Application</strong></td><td>Flash Flood Prediction & Monitoring System</td></tr>
          <tr><td><strong>Version</strong></td><td>2.0.0 (Production)</td></tr>
          <tr><td><strong>ML Model</strong></td><td>Random Forest Classifier (9 features)</td></tr>
          <tr><td><strong>Model Features</strong></td><td>rainfall_mm_hr, elevation_m, slope_degree, rain_1h, rain_3h, rain_6h, rain_12h, rain_24h, rainfall_change</td></tr>
          <tr><td><strong>Backend</strong></td><td>FastAPI + PostgreSQL + SQLAlchemy</td></tr>
          <tr><td><strong>Frontend</strong></td><td>React + Vite + Leaflet</td></tr>
          <tr><td><strong>Weather Data</strong></td><td>Open-Meteo API (real-time)</td></tr>
          <tr><td><strong>Terrain Data</strong></td><td>Local DEM (Uttarakhand) + Open-Meteo Elevation (global fallback)</td></tr>
          <tr><td><strong>Geocoding</strong></td><td>Nominatim / OpenStreetMap</td></tr>
          <tr><td><strong>Authentication</strong></td><td>JWT Bearer Tokens (blacklist-based invalidation)</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function Settings({ onNavigate, onHome }) {
  const { user, setUser, settings, setSettings, token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Derive active tab from URL ?tab= param, default to 'Profile'
  const tabParam = searchParams.get('tab');
  const activeTab = TAB_MAP[tabParam] || 'Profile';

  const setActiveTab = (tabName) => {
    // Find the URL key for this tab name
    const urlKey = Object.keys(TAB_MAP).find(k => TAB_MAP[k] === tabName) || 'profile';
    setSearchParams({ tab: urlKey });
  };

  // Derive sidebar activeSubPage from current tab
  const activeSubPage = Object.keys(TAB_MAP).find(k => TAB_MAP[k] === activeTab) || 'profile';

  const renderTab = () => {
    switch (activeTab) {
      case 'Profile': return <ProfileTab user={user} setUser={setUser} token={token} />;
      case 'Preferences': return <PreferencesTab token={token} settings={settings} setSettings={setSettings} />;
      case 'Notifications': return <NotificationsTab token={token} settings={settings} setSettings={setSettings} />;
      case 'Data & Units': return <DataUnitsTab token={token} settings={settings} setSettings={setSettings} />;
      case 'Security': return <SecurityTab token={token} />;
      case 'Access & Roles': return <AccessRolesTab token={token} user={user} />;
      case 'API & Integrations': return <APIIntegrationsTab />;
      case 'Activity Log': return <ActivityLogTab token={token} />;
      case 'Backup & Restore': return <BackupRestoreTab token={token} user={user} />;
      case 'About': return <AboutTab />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      <Sidebar activePage="settings" activeSubPage={activeSubPage} onNavigate={onNavigate} onHome={onHome} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onNavigate={onNavigate} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>⚙️ Settings</h2>
          <div className="settings-layout">
            {/* Secondary tab nav (visible on wider screens, mirrors sidebar) */}
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`settings-nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="settings-content">
              {renderTab()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

