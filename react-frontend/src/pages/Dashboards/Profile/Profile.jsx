import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import { Camera, Edit2, Save, X } from "lucide-react";
import "./Profile.css";

const API_URL = "http://127.0.0.1:8000/api";

function Profile({ onNavigate }) {
  const { user, token, setUser } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91 98765 43210", // Mock as not in DB
    location: "Uttarakhand, India", // Mock as not in DB
    role: "Administrator"
  });

  // Message state
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: "+91 98765 43210", // Hardcoded mock
        location: "Uttarakhand, India", // Hardcoded mock
        role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Administrator"
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        setUser(data);
        setIsEditing(false);
      } else {
        setMsg({ text: data.detail || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Network error. Could not connect to server.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMsg({ text: '', type: '' });
    // Reset to user context
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  };

  const getInitials = (name) => {
    if (!name) return "SK";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeTab="profile" onNavigate={onNavigate} />
      
      <div className="main-content" style={{ background: "#f8fafc" }}>
        <Navbar 
          title="My Profile" 
          subtitle="View and manage your personal details."
        >
            <div className="profile-breadcrumb">
                <span style={{ color: '#64748b' }}>Home</span>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>&gt;</span>
                <span style={{ color: '#0f172a', fontWeight: '500' }}>Profile</span>
            </div>
        </Navbar>

        <div className="profile-page-content">
          
          <div className="profile-card">
            
            <div className="profile-card-header">
              <h2>Personal Details</h2>
              
              {!isEditing ? (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={15} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-edit-btn" onClick={handleCancel} disabled={saving}>
                    <X size={15} /> Cancel
                  </button>
                  <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
                    <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
            
            {msg.text && (
              <div className={`profile-msg ${msg.type}`}>
                {msg.text}
              </div>
            )}

            <div className="profile-card-body">
              
              <div className="profile-avatar-column">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-circle">
                    {getInitials(formData.name)}
                  </div>
                  <div className="profile-avatar-badge">
                    <Camera size={14} color="white" />
                  </div>
                </div>
                
                <button className="change-photo-btn">
                  <Camera size={14} />
                  Change Photo
                </button>
              </div>
              
              <div className="profile-form-column">
                
                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "input-readonly" : ""}
                  />
                </div>
                
                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "input-readonly" : ""}
                  />
                </div>
                
                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    disabled={true}
                    className="input-readonly"
                  />
                </div>
                
                <div className="profile-form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    disabled={true}
                    className="input-readonly"
                  />
                </div>
                
                <div className="profile-form-group">
                  <label>Role</label>
                  <input 
                    type="text" 
                    value={formData.role} 
                    disabled={true}
                    className="input-readonly"
                  />
                </div>
                
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Profile;
