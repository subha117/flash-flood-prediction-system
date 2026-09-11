import React, { useContext, useState, useRef, useEffect } from "react";
import { Search, Bell, User, MapPin } from "lucide-react";
import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_URL = "http://127.0.0.1:8000/api";

function Navbar({ title, subtitle }) {
  const { updateLocation, alerts } = useContext(LocationContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResults([]);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/location/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
    setSearching(false);
  };

  const handleSelect = (lat, lng) => {
    updateLocation(lat, lng);
    setQuery("");
    setResults([]);
  };

  return (
    <header className="shared-navbar">
      <div className="navbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="navbar-right">
        <form className="navbar-search" onSubmit={handleSearch} ref={dropdownRef}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search location (e.g. Kolkata, Barasat)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <span style={{ position: "absolute", right: 12, top: 10, fontSize: "0.8rem", color: "#94a3b8" }}>Searching...</span>}
          {results.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #e2e8f0", borderRadius: "0 0 8px 8px", zIndex: 1000, maxHeight: "300px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(r.latitude, r.longitude)}
                  style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <MapPin size={14} color="#6366f1" />
                  <span style={{ fontSize: "0.85rem" }}>{r.full_name}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="navbar-notification-container" ref={notificationDropdownRef} style={{ position: 'relative' }}>
            <div className="navbar-notification" onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}>
              <Bell size={18} />
              {alerts && alerts.length > 0 && <span>{alerts.length}</span>}
            </div>

            {notificationDropdownOpen && (
              <div className="navbar-dropdown" style={{ minWidth: '280px', padding: '12px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>Notifications</h4>
                {alerts && alerts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {alerts.map((alert, idx) => (
                      <div key={idx} style={{ padding: '8px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#991b1b', marginBottom: '2px' }}>{alert.type}</strong>
                        <span style={{ fontSize: '12px', color: '#b91c1c' }}>{alert.location_name} • Risk: {alert.severity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No active alerts.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="navbar-profile-container" ref={profileDropdownRef}>
            <div className="navbar-profile" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <div className="navbar-avatar">
                <User size={18} />
              </div>
              <div className="navbar-profile-info">
                <strong>{user?.name || "User"}</strong>
                <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}</span>
              </div>
            </div>
            
            {profileDropdownOpen && (
              <div className="navbar-dropdown">
                <button onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}>
                  Settings
                </button>
                <button className="logout-btn" onClick={() => { setProfileDropdownOpen(false); logout(); navigate('/login'); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
