import React from "react";
import "./Landing.css";
import logo from "../../assets/flashflood-logo.png";
import {
  CloudRain,
  Brain,
  MapPin,
  Bell
} from "lucide-react";

function Landing({ onLogin, onGetStarted }) {
  return (
    <div className="Landing-page">

      {/* NAVBAR */}
      <header className="Landing-navbar">

         { /* logo */}
        <div className="Landing-brand">
          <img
            src={logo}
            alt="FlashFlood Prediction System"
            className="flashflood-logo"
          />
        </div>

        <nav>
            <button className="active">
              Home
            </button>

            <button onClick={onLogin}>
              Features
            </button>

            <button onClick={onLogin}>
              Risk Map
            </button>

            <button onClick={onLogin}>
              How It Works
            </button>

            <button onClick={onLogin}>
              About Us
            </button>

            <button onClick={onLogin}>
              Contact
            </button>
          </nav>

        <div className="nav-buttons">
          <button className="nav-login" onClick={onLogin}>
            Login
          </button>

            <button className="get-started" onClick={onGetStarted}>
            Get Started
          </button>
        </div>

      </header>


      {/* HERO */}
      <main className="Landing-hero">

        <div className="hero-content">

          <h1>
            Predict <span>Floods.</span>
            <br />
            Protect <span>Lives.</span>
          </h1>

          <p>
            Advanced AI and real-time data to predict
            flash flood risk using rainfall, terrain,
            soil conditions and more.<br /> Stay informed. 
            Stay safe.
          </p>

          <div className="hero-buttons">

            <button className="explore-btn" onClick={onGetStarted}>
              Explore Dashboard
              <span>→</span>
            </button>

            <button className="demo-btn" onClick={onLogin}>
              <span>▶</span>
              Watch Demo
            </button>

          </div>


          {/* FEATURES */}
          <div className="hero-features">

            <div className="hero-feature">
              <CloudRain className="hero-feature-icon" />
              <span>Real-time</span>
              <small>Rainfall Data</small>
            </div>

            <div className="hero-feature">
              <Brain className="hero-feature-icon" />
              <span>AI Powered</span>
              <small>Predictions</small>
            </div>

            <div className="hero-feature">
              <MapPin className="hero-feature-icon" />
              <span>Selected Region</span>
              <small>Focused</small>
            </div>

            <div className="hero-feature">
              <Bell className="hero-feature-icon" />
              <span>Early Alerts</span>
              <small>& Notifications</small>
            </div>

          </div>

        </div>


        {/* RISK CARD */}
        <div className="risk-card">

          <div className="risk-header">
            <strong>Current Risk Overview</strong>

            <span>
              <i></i> LIVE
            </span>
          </div>

          <p className="location">
            Selected Location, Selected Region
          </p>

          <div className="risk-score">

            <strong>HIGH RISK</strong>

            <b>82%</b>

          </div>

          <div className="risk-bar">
            <span></span>
            <i></i>
            <em></em>
          </div>

          <div className="risk-stats">

            <div>
              <span className="risk-icon">☁</span>

              <p>Rainfall (24h)</p>
              <strong>135.2 mm</strong>
            </div>

            <div>
              <span className="risk-icon">♧</span>

              <p>Active Alerts</p>
              <strong>3</strong>
            </div>

          </div>

          <div className="risk-updated">
            <span>
              Last Updated: 30 Aug 2026, 10:30 AM
            </span>

            <b>⟳</b>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Landing;
