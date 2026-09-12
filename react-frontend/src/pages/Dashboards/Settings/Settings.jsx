import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Navbar from '../../../components/Navbar/Navbar';
import { AuthContext } from '../../../context/AuthContext';
import { Camera, Pencil, Save, X, User } from 'lucide-react';
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
const ProfileTab = ({ user, token, onUserUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const fileInputRef = useRef(null);

  const [original, setOriginal] = useState({
    name: '', email: '', phone: '', location: '', role: '', photo: null,
  });
  const [form, setForm] = useState({ ...original });
  const [errors, setErrors] = useState({});

  // load real data
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const meData = meRes.ok ? await meRes.json() : {};

        let settingsData = {};
        try {
          const sRes = await fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
          if (sRes.ok) settingsData = await sRes.json();
        } catch {}

        const userId = meData.id || user?.id || '0';
        const extraKey = `app_user_profile_extra_${userId}`;
        let extras = {};
        try { extras = JSON.parse(localStorage.getItem(extraKey) || '{}'); } catch {}

        const data = {
          name: meData.name || '',
          email: meData.email || '',
          phone: extras.phone || '',
          location: settingsData.default_location || '',
          role: meData.role || 'user',
          photo: extras.photo || null,
        };
        setOriginal(data);
        setForm({ ...data });
      } catch (err) { console.error('Failed to load profile:', err); }
      finally { setLoading(false); }
    };
    load();
  }, [token, user]);

  // auto-hide msg
  useEffect(() => {
    if (!msg.text) return;
    const t = setTimeout(() => setMsg({ text: '', ok: true }), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formatRole = (role) => {
    const map = { admin: 'Administrator', gov: 'Government Official', user: 'User' };
    return map[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User');
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = () => { setEditing(true); setErrors({}); setMsg({ text: '', ok: true }); };
  const handleCancel = () => { setForm({ ...original }); setEditing(false); setErrors({}); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const profileRes = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (!profileRes.ok) {
        const d = await profileRes.json().catch(() => ({}));
        throw new Error(d.detail || 'Failed to update profile.');
      }

      if (form.location !== original.location) {
        await fetch(`${API}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ default_location: form.location }),
        });
      }

      const userId = user?.id || '0';
      const extraKey = `app_user_profile_extra_${userId}`;
      localStorage.setItem(extraKey, JSON.stringify({ phone: form.phone, photo: form.photo }));

      setOriginal({ ...form });
      setEditing(false);
      setMsg({ text: 'Profile updated successfully!', ok: true });
      onUserUpdate?.({ name: form.name, email: form.email, role: form.role });
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save.', ok: false });
    } finally { setSaving(false); }
  };

  const handlePhotoClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setForm(p => ({ ...p, photo: dataUrl }));
      const userId = user?.id || '0';
      const extraKey = `app_user_profile_extra_${userId}`;
      let extras = {};
      try { extras = JSON.parse(localStorage.getItem(extraKey) || '{}'); } catch {}
      extras.photo = dataUrl;
      localStorage.setItem(extraKey, JSON.stringify(extras));
      setOriginal(p => ({ ...p, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const initials = getInitials(form.name || user?.name);
  const displayRole = formatRole(form.role || user?.role);

  if (loading) {
    return <div className="tab-pane"><div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading profile…</div></div>;
  }

  return (
    <div className="tab-pane">
      {/* Page title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1768d8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <User size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, fontSize: '1.3rem' }}>My Profile</h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>View and manage your personal details.</p>
        </div>
      </div>

      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'} style={{ marginTop: 16 }}>{msg.text}</div>}

      {/* Card */}
      <div style={{ background: '#fff', border: '1px solid #dfe6ee', borderRadius: 12, padding: '28px 32px', marginTop: 20 }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Personal Details</h4>
          {!editing ? (
            <button type="button" onClick={handleEdit} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px',
              border: '1.5px solid #1768d8', borderRadius: 8, background: '#fff',
              color: '#1768d8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <Pencil size={15} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleCancel} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px',
                border: '1.5px solid #cbd5e1', borderRadius: 8, background: '#fff',
                color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <X size={15} /> Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px',
                border: 'none', borderRadius: 8, background: '#1768d8',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Body grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>
          {/* Left: Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 10 }}>
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%', background: '#334155', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 52, fontWeight: 700, letterSpacing: 2, overflow: 'hidden', userSelect: 'none',
              }}>
                {form.photo ? <img src={form.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div onClick={handlePhotoClick} title="Change photo" style={{
                position: 'absolute', bottom: 6, right: 6, width: 36, height: 36,
                borderRadius: '50%', background: '#1768d8', color: '#fff',
                border: '3px solid #fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', zIndex: 2,
              }}>
                <Camera size={16} />
              </div>
            </div>
            <button type="button" onClick={handlePhotoClick} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px',
              border: '1.5px solid #1768d8', borderRadius: 8, background: '#fff',
              color: '#1768d8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <Camera size={14} /> Change Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          {/* Right: Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Name</label>
              <input type="text" value={form.name} readOnly={!editing}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${errors.name ? '#ef4444' : '#dfe6ee'}`,
                  borderRadius: 8, fontSize: 14, color: '#1e293b',
                  background: editing ? '#fff' : '#f8fafc', outline: 'none', boxSizing: 'border-box',
                }}
              />
              {errors.name && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={form.email} readOnly={!editing}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${errors.email ? '#ef4444' : '#dfe6ee'}`,
                  borderRadius: 8, fontSize: 14, color: '#1e293b',
                  background: editing ? '#fff' : '#f8fafc', outline: 'none', boxSizing: 'border-box',
                }}
              />
              {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone Number</label>
              <input type="tel" value={form.phone} readOnly={!editing}
                placeholder={editing ? '+91 XXXXX XXXXX' : ''}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #dfe6ee',
                  borderRadius: 8, fontSize: 14, color: '#1e293b',
                  background: editing ? '#fff' : '#f8fafc', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Location</label>
              <input type="text" value={form.location} readOnly={!editing}
                placeholder={editing ? 'City, Country' : ''}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #dfe6ee',
                  borderRadius: 8, fontSize: 14, color: '#1e293b',
                  background: editing ? '#fff' : '#f8fafc', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Role</label>
              <input type="text" value={displayRole} readOnly
                style={{
                  width: '100%', padding: '11px 14px', border: '1px solid #dfe6ee',
                  borderRadius: 8, fontSize: 14, color: '#64748b',
                  background: '#f1f5f9', outline: 'none', boxSizing: 'border-box', cursor: 'default',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Preferences ────────────────────────────────────────────────────────────
const PreferencesTab = ({ token }) => {
  const [theme, setTheme] = useState('light');
  const [units, setUnits] = useState('metric');
  const [defaultLoc, setDefaultLoc] = useState('Kolkata');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setTheme(d.theme || 'light');
        setUnits(d.units || 'metric');
        setDefaultLoc(d.default_location || 'Kolkata');
      }).catch(() => {});
  }, [token]);

  const handleSave = async () => {
    const res = await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ theme, units, default_location: defaultLoc }),
    });
    setMsg(res.ok ? 'Preferences saved!' : 'Failed to save.');
  };

  return (
    <div className="tab-pane">
      <h3>Preferences</h3>
      {msg && <div className="alert-success">{msg}</div>}
      <div className="form-group"><label>Theme</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="form-group"><label>Units</label>
        <select value={units} onChange={e => setUnits(e.target.value)}>
          <option value="metric">Metric (mm, °C, m)</option>
          <option value="imperial">Imperial (in, °F, ft)</option>
        </select>
      </div>
      <div className="form-group"><label>Default Location</label>
        <input type="text" value={defaultLoc} onChange={e => setDefaultLoc(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={handleSave}>Save Preferences</button>
    </div>
  );
};

// ─── Notifications ───────────────────────────────────────────────────────────
const NotificationsTab = ({ token }) => {
  const [enabled, setEnabled] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setEnabled(d.notifications_enabled ?? true)).catch(() => {});
  }, [token]);

  const handleSave = async () => {
    const res = await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notifications_enabled: enabled }),
    });
    setMsg(res.ok ? 'Notification settings saved!' : 'Failed to save.');
  };

  return (
    <div className="tab-pane">
      <h3>Notification Settings</h3>
      {msg && <div className="alert-success">{msg}</div>}
      <div className="form-group toggle-group">
        <label>Enable Flood Alerts</label>
        <label className="toggle">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          <span className="slider"></span>
        </label>
      </div>
      <p className="hint">When enabled, you will receive real-time flood risk alerts for monitored locations.</p>
      <button className="btn-primary" onClick={handleSave}>Save</button>
    </div>
  );
};

// ─── Data & Units ────────────────────────────────────────────────────────────
const DataUnitsTab = ({ token }) => {
  const [units, setUnits] = useState('metric');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setUnits(d.units || 'metric')).catch(() => {});
  }, [token]);

  const handleSave = async () => {
    const res = await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ units }),
    });
    setMsg(res.ok ? 'Units saved!' : 'Failed to save.');
  };

  return (
    <div className="tab-pane">
      <h3>Data & Units</h3>
      {msg && <div className="alert-success">{msg}</div>}
      <div className="form-group"><label>Measurement System</label>
        <select value={units} onChange={e => setUnits(e.target.value)}>
          <option value="metric">Metric — mm, °C, metres</option>
          <option value="imperial">Imperial — inches, °F, feet</option>
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
      <button className="btn-primary" onClick={handleSave}>Save</button>
    </div>
  );
};

// ─── Security ────────────────────────────────────────────────────────────────
const SecurityTab = ({ token }) => {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: true });

  const handleChange = async (e) => {
    e.preventDefault();
    if (newPwd !== confirm) { setMsg({ text: 'Passwords do not match.', ok: false }); return; }
    if (newPwd.length < 8) { setMsg({ text: 'Password must be at least 8 characters.', ok: false }); return; }
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: newPwd }),
      });
      const data = await res.json();
      if (res.ok) { setMsg({ text: 'Password changed!', ok: true }); setCurrent(''); setNewPwd(''); setConfirm(''); }
      else setMsg({ text: data.detail || 'Failed to change password.', ok: false });
    } catch { setMsg({ text: 'Network error.', ok: false }); }
  };

  return (
    <div className="tab-pane">
      <h3>Security</h3>
      {msg.text && <div className={msg.ok ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
      <form onSubmit={handleChange}>
        <div className="form-group"><label>Current Password</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
        </div>
        <div className="form-group"><label>New Password</label>
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
        </div>
        <div className="form-group"><label>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Change Password</button>
      </form>
    </div>
  );
};

// ─── Access & Roles ──────────────────────────────────────────────────────────
const AccessRolesTab = ({ token, user }) => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setUsers).catch(() => {});
  }, [token, user]);

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`${API}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMsg('Role updated!');
    } else setMsg('Failed to update role.');
  };

  if (user?.role !== 'admin') return (
    <div className="tab-pane">
      <div className="alert-error">⛔ Admin access required for this section.</div>
    </div>
  );

  return (
    <div className="tab-pane">
      <h3>Access & Roles</h3>
      {msg && <div className="alert-success">{msg}</div>}
      <table className="settings-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
              <td>
                {u.id !== user?.id && (
                  <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                    <option value="user">User</option>
                    <option value="gov">Gov</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const { user, token } = useContext(AuthContext);
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
      case 'Profile': return <ProfileTab user={user} token={token} />;
      case 'Preferences': return <PreferencesTab token={token} />;
      case 'Notifications': return <NotificationsTab token={token} />;
      case 'Data & Units': return <DataUnitsTab token={token} />;
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

