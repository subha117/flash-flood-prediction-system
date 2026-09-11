import React from 'react';

const GovDashboard = () => {
  return (
    <div className="gov-dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' }}>
      {/* Sidebar Mockup */}
      <aside className="sidebar" style={{ width: '250px', backgroundColor: '#1d2b36', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#4caf50', textAlign: 'center' }}>GovAlert System</h2>
        <ul style={{ listStyleType: 'none', padding: 0, flex: 1 }}>
          <li style={{ padding: '15px 10px', borderBottom: '1px solid #33424d', cursor: 'pointer', backgroundColor: '#2a3b47', borderRadius: '4px' }}>Dashboard Overview</li>
          <li style={{ padding: '15px 10px', borderBottom: '1px solid #33424d', cursor: 'pointer' }}>Regional Risk Maps</li>
          <li style={{ padding: '15px 10px', borderBottom: '1px solid #33424d', cursor: 'pointer' }}>Evacuation Routes</li>
          <li style={{ padding: '15px 10px', borderBottom: '1px solid #33424d', cursor: 'pointer' }}>Resource Management</li>
          <li style={{ padding: '15px 10px', cursor: 'pointer' }}>Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar Mockup */}
        <header className="navbar" style={{ backgroundColor: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>Government Operations Center</h1>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: '500', color: '#555' }}>Admin Officer</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4caf50', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
          </div>
        </header>

        {/* Dashboard View */}
        <main className="dashboard-body" style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem' }}>Regional Flood Risk Overview</h2>
            <button style={{ 
              backgroundColor: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              fontSize: '1rem', 
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(231, 76, 60, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ Broadcast Emergency Alert
            </button>
          </div>

          {/* Mockup Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Widget 1 */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#34495e', fontSize: '1.2rem' }}>Current Critical Alerts</h3>
              <div style={{ padding: '16px', backgroundColor: '#fdf2f2', borderRadius: '6px', borderLeft: '4px solid #e74c3c' }}>
                <strong style={{ color: '#c0392b', display: 'block', marginBottom: '4px' }}>High Risk: Zone A</strong>
                <span style={{ color: '#555', fontSize: '0.95rem' }}>Flash Flood Warning. River levels exceeded safety threshold by 1.2m.</span>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#fff9e6', borderRadius: '6px', borderLeft: '4px solid #f1c40f', marginTop: '12px' }}>
                <strong style={{ color: '#f39c12', display: 'block', marginBottom: '4px' }}>Moderate Risk: Zone C</strong>
                <span style={{ color: '#555', fontSize: '0.95rem' }}>Heavy rainfall expected in the next 4 hours. Monitor closely.</span>
              </div>
            </div>

            {/* Widget 2 */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#34495e', fontSize: '1.2rem' }}>Weather Radar Integration</h3>
              <div style={{ height: '220px', backgroundColor: '#eaf2f8', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#5d6d7e', border: '2px dashed #d5d8dc' }}>
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🗺️</span>
                <span>[Interactive Radar Map Placeholder]</span>
              </div>
            </div>

            {/* Widget 3 */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#34495e', fontSize: '1.2rem' }}>Active Evacuation Centers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#444', fontWeight: '500' }}>Community Hall A</span>
                  <span style={{ backgroundColor: '#e8f8f5', color: '#117a65', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>45% Full</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#444', fontWeight: '500' }}>City Stadium</span>
                  <span style={{ backgroundColor: '#e8f8f5', color: '#117a65', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>12% Full</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#444', fontWeight: '500' }}>Westside High School</span>
                  <span style={{ backgroundColor: '#f4f6f7', color: '#7f8c8d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>Standby</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GovDashboard;
