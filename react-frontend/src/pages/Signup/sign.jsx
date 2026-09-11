import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./sign.css";
import flashFloodLogo from "../../assets/flashflood-logo.png";

function Sign({ onLogin, onDashboard }) {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "user"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms and conditions."); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError(null);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      if (user?.role === "admin") navigate("/admin");
      else if (user?.role === "gov") navigate("/gov");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.message?.replace("Registration failed: ", "") || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div className="signup-left">
        {/* Brand */}
        <div className="brand">
          <img src={flashFloodLogo} alt="FlashFlood Logo" style={{ width: 200, height: "auto" }} />
        </div>

        {/* Hero text */}
        <div className="left-content">
          <h1>Join the Flood<br />Early Warning Network</h1>
          <p>Create your account to get real-time flood predictions, alerts and access to the monitoring dashboard.</p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">🌧</div>
              <div>
                <h3>Live Data</h3>
                <span>Real-time rainfall and weather monitoring</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🤖</div>
              <div>
                <h3>ML Predictions</h3>
                <span>Random Forest model with 9 features</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔔</div>
              <div>
                <h3>Instant Alerts</h3>
                <span>Automatic flood risk notifications</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🗺</div>
              <div>
                <h3>Risk Map</h3>
                <span>Interactive global flood risk mapping</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <div className="signup-right">
        {/* Top login link */}
        <div className="top-login">
          <span>Already have an account?</span>
          <button type="button" onClick={onLogin}>Sign in</button>
        </div>

        <div className="signup-card">
          <h2>Create Account</h2>
          <p className="card-subtitle">Start monitoring flood risks in your region today.</p>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fca5a5",
              color: "#991b1b", padding: "12px 16px", borderRadius: "10px",
              marginBottom: "18px", fontSize: "14px", fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="input-box">
              <span>👤</span>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-box">
              <span>✉️</span>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="input-box">
              <span>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {/* Role */}
            <div className="input-box">
              <span>🏷</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, color: "#172033" }}
              >
                <option value="user">Standard User — Citizen / Researcher</option>
                <option value="gov">Government Official — Regional Authority</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            {/* Terms */}
            <label className="terms">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              I agree to the&nbsp;
              <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
              &nbsp;and&nbsp;
              <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="create-btn"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Sign;