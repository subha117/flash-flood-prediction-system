import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import flashFloodLogo from "../../assets/flashflood-logo.png";

function Login({ onSignup, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div className="login-left">
        {/* Logo */}
        <div className="Login-brand">
          <img src={flashFloodLogo} alt="FlashFlood Logo" className="flashflood-logo" />
        </div>

        {/* Hero text */}
        <div className="left-main">
          <h1>Real-Time Flood<br />Prediction &amp; Monitoring</h1>
          <p>AI-powered early warning system protecting communities<br />with live weather data, terrain analysis and ML risk scoring.</p>

          {/* Feature icons */}
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🌧</div>
              <span>Live Rainfall Tracking</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🤖</div>
              <span>ML Risk Prediction</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🗺</div>
              <span>Interactive Risk Map</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🔔</div>
              <span>Instant Flood Alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-description">
            Sign in to your account to access the flood monitoring dashboard.
          </p>

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

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="input-box">
              <span className="input-icon">✉️</span>
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
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {/* Remember / Forgot */}
            <div className="login-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => alert("Please contact your administrator to reset your password.")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <div className="register-prompt">
            <span>Don't have an account?</span>
            <button type="button" onClick={onSignup}>Create account</button>
          </div>

          {/* Security note */}
          <div className="security-box">
            <span className="security-icon">🔐</span>
            <p>
              Your session is protected with JWT authentication and token blacklisting.
              All data is encrypted in transit over HTTPS. Passwords are hashed with bcrypt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;