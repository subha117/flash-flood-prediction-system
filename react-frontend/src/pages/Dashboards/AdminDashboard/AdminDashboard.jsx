import React from 'react';

const AdminDashboard = () => {
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    sidebar: {
      width: '250px',
      backgroundColor: '#2c3e50',
      color: '#fff',
      padding: '20px',
    },
    sidebarItem: {
      padding: '10px 0',
      cursor: 'pointer',
      borderBottom: '1px solid #34495e',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ecf0f1',
    },
    navbar: {
      height: '60px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      justifyContent: 'space-between',
    },
    contentArea: {
      padding: '20px',
      overflowY: 'auto',
    },
    card: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      borderBottom: '2px solid #ddd',
      backgroundColor: '#f8f9fa',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #ddd',
    },
    statusBadge: (status) => ({
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      color: '#fff',
      backgroundColor: status === 'Active' || status === 'Healthy' ? '#2ecc71' : '#e74c3c',
    }),
  };

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Inactive' },
  ];

  const apiHealth = [
    { service: 'Authentication API', endpoint: '/api/v1/auth', status: 'Healthy', latency: '45ms' },
    { service: 'Weather Data API', endpoint: '/api/v1/weather', status: 'Healthy', latency: '120ms' },
    { service: 'Prediction Engine', endpoint: '/api/v1/predict', status: 'Degraded', latency: '850ms' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2>Admin Panel</h2>
        <div style={{ marginTop: '30px' }}>
          <div style={styles.sidebarItem}>Dashboard</div>
          <div style={styles.sidebarItem}>Users</div>
          <div style={styles.sidebarItem}>System Health</div>
          <div style={styles.sidebarItem}>Settings</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Navbar */}
        <div style={styles.navbar}>
          <h3>Flash Flood Prediction System</h3>
          <div>Admin User</div>
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {/* Users Table */}
          <div style={styles.card}>
            <h3>System Users</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.role}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(user.status)}>{user.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* API Health Table */}
          <div style={styles.card}>
            <h3>API Health</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Latency</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {apiHealth.map((api, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{api.service}</td>
                    <td style={styles.td}>{api.endpoint}</td>
                    <td style={styles.td}>{api.latency}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(api.status)}>{api.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
