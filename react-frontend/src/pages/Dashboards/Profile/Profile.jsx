import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Pencil,
  Camera,
  Save,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { AuthContext } from "../../../context/AuthContext";
import { LocationContext } from "../../../context/LocationContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API = "http://127.0.0.1:8000/api";

function Profile({ onNavigate, onHome }) {
  const { user, token, logout } = useContext(AuthContext);
  const { alerts } = useContext(LocationContext);
  const navigate = useNavigate();

  // ── state ──
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // original data (from server + localStorage)
  const [original, setOriginal] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    photo: null,
  });

  // editable form state
  const [form, setForm] = useState({ ...original });
  const [errors, setErrors] = useState({});

  // dropdowns
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);

  // close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── load real data ──
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        // 1) fetch /api/auth/me
        const meRes = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = meRes.ok ? await meRes.json() : {};

        // 2) fetch /api/settings for default_location
        let settingsData = {};
        try {
          const sRes = await fetch(`${API}/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sRes.ok) settingsData = await sRes.json();
        } catch {}

        // 3) localStorage extras (phone & photo)
        const userId = meData.id || user?.id || "0";
        const extraKey = `app_user_profile_extra_${userId}`;
        let extras = {};
        try {
          extras = JSON.parse(localStorage.getItem(extraKey) || "{}");
        } catch {}

        const data = {
          name: meData.name || "",
          email: meData.email || "",
          phone: extras.phone || "",
          location: settingsData.default_location || "",
          role: meData.role || "user",
          photo: extras.photo || null,
        };

        setOriginal(data);
        setForm({ ...data });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user]);

  // ── auto-hide toast ──
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── helpers ──
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "User";
    const map = {
      admin: "Administrator",
      gov: "Government Official",
      user: "User",
    };
    return map[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // ── validation ──
  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── edit toggle ──
  const handleEdit = () => {
    setEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setForm({ ...original });
    setEditing(false);
    setErrors({});
  };

  // ── save ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // 1) PUT /api/auth/profile  → name, email
      const profileRes = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (!profileRes.ok) {
        const d = await profileRes.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to update profile.");
      }

      // 2) PUT /api/settings  → default_location
      if (form.location !== original.location) {
        await fetch(`${API}/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ default_location: form.location }),
        });
      }

      // 3) phone + photo → localStorage
      const userId = user?.id || "0";
      const extraKey = `app_user_profile_extra_${userId}`;
      localStorage.setItem(
        extraKey,
        JSON.stringify({ phone: form.phone, photo: form.photo })
      );

      // commit
      setOriginal({ ...form });
      setEditing(false);
      setToast({ type: "success", msg: "Profile updated successfully!" });
    } catch (err) {
      setToast({ type: "error", msg: err.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  // ── photo pick ──
  const handlePhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setForm((prev) => ({ ...prev, photo: dataUrl }));
      // persist immediately in localStorage
      const userId = user?.id || "0";
      const extraKey = `app_user_profile_extra_${userId}`;
      let extras = {};
      try {
        extras = JSON.parse(localStorage.getItem(extraKey) || "{}");
      } catch {}
      extras.photo = dataUrl;
      localStorage.setItem(extraKey, JSON.stringify(extras));
      setOriginal((prev) => ({ ...prev, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // derived display values
  const displayName = form.name || user?.name || "User";
  const displayRole = formatRole(form.role || user?.role);
  const initials = getInitials(displayName);
  const alertCount = alerts?.length || 0;

  return (
    <div className="profile-page">
      <Sidebar
        activePage="profile"
        onNavigate={onNavigate}
        onHome={onHome}
      />

      <div className="profile-main">
        {/* ── top bar ── */}
        <div className="profile-topbar">
          <div className="profile-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search locations, reports, predictions..."
              readOnly
            />
          </div>

          <div className="profile-bell-wrap">
            <Bell size={18} color="#475569" />
            {alertCount > 0 && (
              <span className="bell-badge">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </div>

          <div className="profile-topbar-user" ref={profileRef}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="profile-topbar-avatar">
                {form.photo ? (
                  <img src={form.photo} alt="avatar" />
                ) : (
                  initials
                )}
              </div>
              <div className="profile-topbar-info">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {profileOpen && (
              <div className="topbar-dropdown">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onNavigate) onNavigate("settings");
                  }}
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  className="logout-btn"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── scrollable content ── */}
        <div className="profile-content">
          {/* page header */}
          <div className="profile-page-header">
            <div className="profile-page-title-group">
              <div className="profile-page-icon">
                <User size={22} />
              </div>
              <div className="profile-page-title">
                <h1>My Profile</h1>
                <p>View and manage your personal details.</p>
              </div>
            </div>
            <div className="profile-breadcrumb">
              <button
                className="bc-link"
                onClick={() => {
                  if (onNavigate) onNavigate("dashboard");
                }}
              >
                Home
              </button>
              <span className="bc-sep">&gt;</span>
              <span className="bc-current">Profile</span>
            </div>
          </div>

          {/* ── card ── */}
          {loading ? (
            <div className="profile-card">
              <div className="profile-loading">Loading profile…</div>
            </div>
          ) : (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Personal Details</h2>

                {!editing ? (
                  <button
                    className="btn-edit-profile"
                    onClick={handleEdit}
                    type="button"
                  >
                    <Pencil size={15} /> Edit Profile
                  </button>
                ) : (
                  <div className="profile-card-actions">
                    <button
                      className="btn-cancel"
                      onClick={handleCancel}
                      type="button"
                    >
                      <X size={15} /> Cancel
                    </button>
                    <button
                      className="btn-save"
                      onClick={handleSave}
                      type="button"
                      disabled={saving}
                    >
                      <Save size={15} />{" "}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-card-body">
                {/* left: avatar */}
                <div className="profile-avatar-col">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar-circle">
                      {form.photo ? (
                        <img src={form.photo} alt="avatar" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div
                      className="profile-avatar-camera"
                      onClick={handlePhotoClick}
                      title="Change photo"
                    >
                      <Camera size={16} />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-change-photo"
                    onClick={handlePhotoClick}
                  >
                    <Camera size={14} /> Change Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* right: form fields */}
                <div className="profile-fields-col">
                  {/* Full Name */}
                  <div className="profile-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      readOnly={!editing}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className={errors.name ? "field-error" : ""}
                    />
                    {errors.name && (
                      <div className="field-error-msg">{errors.name}</div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="profile-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly={!editing}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className={errors.email ? "field-error" : ""}
                    />
                    {errors.email && (
                      <div className="field-error-msg">{errors.email}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="profile-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      readOnly={!editing}
                      placeholder={editing ? "+91 XXXXX XXXXX" : ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>

                  {/* Location */}
                  <div className="profile-field">
                    <label>Location</label>
                    <input
                      type="text"
                      value={form.location}
                      readOnly={!editing}
                      placeholder={editing ? "City, Country" : ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, location: e.target.value }))
                      }
                    />
                  </div>

                  {/* Role — always read-only */}
                  <div className="profile-field">
                    <label>Role</label>
                    <input type="text" value={displayRole} readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── toast ── */}
      {toast && (
        <div className={`profile-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default Profile;
