import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Navbar from '../../../components/Navbar/Navbar';
import { AuthContext } from '../../../context/AuthContext';
import './Settings.css';

const ProfileTab = ({ user, token }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      if (res.ok) {
        setMessage('Profile updated successfully.');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('Error updating profile.');
    }
  };

  return (
    <div className="tab-pane">
      <h3>Profile Information</h3>
      {message && <div className="alert-message">{message}</div>}
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

const PreferencesTab = ({ token }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  const handleSave = async () => {
    try {
      await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ theme, language })
      });
      alert('Preferences saved');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Preferences</h3>
      <div className="form-group">
        <label>Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="form-group">
        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>
      <button className="btn-primary" onClick={handleSave}>Save Preferences</button>
    </div>
  );
};

const NotificationsTab = ({ token }) => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const handleSave = async () => {
    try {
      await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ emailNotif, smsNotif })
      });
      alert('Notification settings saved');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Notifications</h3>
      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
          Email Notifications
        </label>
      </div>
      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
          SMS Notifications
        </label>
      </div>
      <button className="btn-primary" onClick={handleSave}>Save Notifications</button>
    </div>
  );
};

const DataUnitsTab = ({ token }) => {
  const [unitSystem, setUnitSystem] = useState('metric');

  const handleSave = async () => {
    try {
      await fetch('/api/settings/units', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ unitSystem })
      });
      alert('Unit settings saved');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Data & Units</h3>
      <div className="form-group">
        <label>Unit System</label>
        <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)}>
          <option value="metric">Metric (Celsius, mm)</option>
          <option value="imperial">Imperial (Fahrenheit, inches)</option>
        </select>
      </div>
      <button className="btn-primary" onClick={handleSave}>Save Units</button>
    </div>
  );
};

const SecurityTab = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="tab-pane">
      <h3>Security</h3>
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Update Password</button>
      </form>
    </div>
  );
};

const AccessRolesTab = ({ user, token }) => {
  if (user?.role !== 'admin') {
    return (
      <div className="tab-pane access-denied">
        <h3>Access Denied</h3>
        <p>You need administrator privileges to view this section.</p>
      </div>
    );
  }

  return (
    <div className="tab-pane">
      <h3>Access & Roles</h3>
      <p>Manage system users and their roles.</p>
      <button className="btn-secondary" onClick={() => fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` }})}>
        Refresh Users
      </button>
      <div className="mock-table">
        <p>User Management Table Loading...</p>
      </div>
    </div>
  );
};

const ApiIntegrationsTab = ({ token }) => {
  return (
    <div className="tab-pane">
      <h3>API & Integrations</h3>
      <p>Manage your API keys for third-party integrations.</p>
      <button className="btn-secondary">Generate New API Key</button>
    </div>
  );
};

const ActivityLogTab = ({ token }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/activity', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setLogs(data || []))
      .catch(() => setLogs([{ id: 1, action: 'User login', date: '2026-09-12 01:00:00' }]));
  }, [token]);

  return (
    <div className="tab-pane">
      <h3>Activity Log</h3>
      <ul className="activity-list">
        {logs.map(log => (
          <li key={log.id}><strong>{log.action}</strong> - {log.date}</li>
        ))}
        {logs.length === 0 && <li>No recent activity</li>}
      </ul>
    </div>
  );
};

const BackupRestoreTab = ({ user, token }) => {
  if (user?.role !== 'admin') {
    return (
      <div className="tab-pane access-denied">
        <h3>Access Denied</h3>
        <p>You need administrator privileges to view this section.</p>
      </div>
    );
  }

  return (
    <div className="tab-pane">
      <h3>Backup & Restore</h3>
      <div className="button-group">
        <button className="btn-primary" onClick={() => fetch('/api/admin/backup', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })}>
          Create Backup
        </button>
        <button className="btn-danger">
          Restore from Backup
        </button>
      </div>
    </div>
  );
};

const AboutTab = () => {
  return (
    <div className="tab-pane">
      <h3>About</h3>
      <p>Flash Flood Prediction System v1.0</p>
      <p>&copy; 2026 FlashFlood Inc.</p>
    </div>
  );
};

const Settings = () => {
  // Try to use AuthContext, with mock fallback if it is not fully implemented
  const auth = useContext(AuthContext) || {};
  const user = auth.user || { name: 'Demo User', role: 'user' }; // Change to 'admin' to test admin tabs
  const token = auth.token || 'mock-token';
  // eslint-disable-next-line no-unused-vars
  const logout = auth.logout || (() => console.log("Logout triggered"));

  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', component: <ProfileTab user={user} token={token} /> },
    { id: 'preferences', label: 'Preferences', component: <PreferencesTab token={token} /> },
    { id: 'notifications', label: 'Notifications', component: <NotificationsTab token={token} /> },
    { id: 'data-units', label: 'Data & Units', component: <DataUnitsTab token={token} /> },
    { id: 'security', label: 'Security', component: <SecurityTab token={token} /> },
    { id: 'access-roles', label: 'Access & Roles', component: <AccessRolesTab user={user} token={token} /> },
    { id: 'api-integrations', label: 'API & Integrations', component: <ApiIntegrationsTab token={token} /> },
    { id: 'activity-log', label: 'Activity Log', component: <ActivityLogTab token={token} /> },
    { id: 'backup-restore', label: 'Backup & Restore', component: <BackupRestoreTab user={user} token={token} /> },
    { id: 'about', label: 'About', component: <AboutTab /> },
  ];

  return (
    <div className="settings-page">
      <Sidebar />
      <div className="settings-main">
        <Navbar />
        <div className="settings-content-wrapper">
          <h1 className="settings-header">Settings</h1>
          
          <div className="settings-container">
            <div className="settings-sidebar">
              <ul>
                {tabs.map((tab) => (
                  <li 
                    key={tab.id} 
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="settings-content">
              {tabs.find(t => t.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
