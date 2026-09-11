import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./sign.css";
import flashFloodLogo from "../../assets/flashflood-logo.png";
import { useNavigate } from "react-router-dom";

function Sign({ onLogin, onDashboard }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
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
    setLoading(true);
    setError(null);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "gov") navigate("/gov");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <img src={flashFloodLogo} alt="FlashFlood System Logo" className="signup-logo" />
        </div>

        <form className="signup-form" onSubmit={handleSignup}>
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Create a password (min 8 characters)" required />
          </div>

          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleInputChange}>
              <option value="user">Standard User</option>
              <option value="gov">Government Official</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">Already have an account? <span onClick={onLogin}>Log in here</span></p>
      </div>
    </div>
  );
}

export default Sign;