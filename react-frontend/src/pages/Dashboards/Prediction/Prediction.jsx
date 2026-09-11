import React, { useEffect, useState, useRef } from "react";
import {
  Search, Bell, User, ChevronDown, MapPin, CloudRain, Droplets,
  Mountain, Waves, Navigation, ArrowRight, Check, ShieldCheck,
  AlertTriangle, Info, RefreshCw, X, CheckCircle,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { fetchFeatures, runPrediction } from "../../../services/api";
import "./Prediction.css";

// Fix default leaflet icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* =========================================================
   MAP CONTROLLER — fly to new coords
========================================================= */
function MapController({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coordinates.lat, coordinates.lng], 10, { duration: 1.2 });
  }, [coordinates, map]);
  return null;
}

/* =========================================================
   CLICK HANDLER — lets user click map to pick location
========================================================= */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* =========================================================
   RECOMMENDATION helper based on risk
========================================================= */
function getActions(riskLevel) {
  const low = [
    "No immediate action required.",
    "Continue monitoring local weather updates.",
    "Keep emergency contacts handy as a precaution.",
  ];
  const medium = [
    "Stay alert and monitor local weather updates.",
    "Avoid unnecessary travel near water bodies.",
    "Prepare emergency supplies as a precaution.",
    "Follow local authority advisories.",
  ];
  const high = [
    "Stay alert and monitor local weather updates.",
    "Avoid low-lying areas and riverbanks.",
    "Follow instructions from local authorities immediately.",
    "Keep emergency contacts handy.",
    "Prepare to evacuate if instructed.",
  ];
  if (!riskLevel) return medium;
  const r = riskLevel.toUpperCase();
  if (r === "LOW") return low;
  if (r === "HIGH") return high;
  return medium;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
function Prediction({ onNavigate }) {
  const [location, setLocation] = useState("Selected Location");
  const [coordinates, setCoordinates] = useState({ lat: 30.372, lng: 78.492 });
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Environment data (from backend /features or defaults)
  const [environment, setEnvironment] = useState({
    rainfall1h: null,
    rainfall3h: null,
    rainfall6h: null,
    rainfall24h: null,
    rainfall72h: null,
    elevation: null,
    slope: null,
    rainfallCurrent: null,
    rainfallChange: null,
  });

  const [featuresStatus, setFeaturesStatus] = useState("idle"); // idle | loading | loaded | error | outside
  const [featuresError, setFeaturesError] = useState("");

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionDone, setPredictionDone] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState("");

  // Recent predictions (stored in localStorage)
  const [recentPredictions, setRecentPredictions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentPredictions") || "[]");
    } catch {
      return [];
    }
  });

  /* -------------------------------------------------------
     Load features whenever coordinates change
  ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadFeatures() {
      setFeaturesStatus("loading");
      setFeaturesError("");
      setPredictionDone(false);
      setPrediction(null);

      try {
        const data = await fetchFeatures(coordinates.lat, coordinates.lng);

        if (cancelled) return;

        if (data.error) {
          setFeaturesStatus("outside");
          setFeaturesError(data.error);
          return;
        }

        setEnvironment({
          rainfall1h: data.rain_1h,
          rainfall3h: data.rain_3h,
          rainfall6h: data.rain_6h,
          rainfall24h: data.rain_24h,
          rainfall72h: null, // not in our dataset
          elevation: data.elevation_m,
          slope: data.slope_degree,
          rainfallCurrent: data.rainfall_mm_hr,
          rainfallChange: data.rainfall_change,
        });
        setFeaturesStatus("loaded");
      } catch (err) {
        if (!cancelled) {
          setFeaturesStatus("error");
          setFeaturesError("Backend is unavailable. Please start the FastAPI server.");
        }
      }
    }

    loadFeatures();
    return () => { cancelled = true; };
  }, [coordinates]);

  /* -------------------------------------------------------
     Location search via Nominatim
  ------------------------------------------------------- */
  const handleLocationSearch = async () => {
    if (!location.trim()) return;
    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await res.json();
      if (!data.length) { alert("Location not found. Please try another location."); return; }
      setCoordinates({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      setLocation(data[0].display_name.split(",").slice(0, 2).join(","));
    } catch {
      alert("Unable to search location.");
    } finally {
      setSearchingLocation(false);
    }
  };

  /* -------------------------------------------------------
     Map click — pick coordinates directly
  ------------------------------------------------------- */
  const handleMapClick = (lat, lng) => {
    setCoordinates({ lat, lng });
    setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  /* -------------------------------------------------------
     Run prediction against real FastAPI backend
  ------------------------------------------------------- */
  const handlePredict = async () => {
    if (featuresStatus !== "loaded") {
      alert("Please select a location within the available coverage area first.");
      return;
    }

    setIsPredicting(true);
    setPredictionDone(false);
    setPredictionError("");

    try {
      const payload = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        rainfall_mm_hr: environment.rainfallCurrent ?? 0,
        elevation_m: environment.elevation ?? 0,
        slope_degree: environment.slope ?? 0,
        rain_1h: environment.rainfall1h ?? 0,
        rain_3h: environment.rainfall3h ?? 0,
        rain_6h: environment.rainfall6h ?? 0,
        rain_12h: environment.rainfall24h ?? 0, // best available if 12h not separate
        rain_24h: environment.rainfall24h ?? 0,
        rainfall_change: environment.rainfallChange ?? 0,
      };

      const result = await runPrediction(payload);

      const probabilityPct = Math.round(result.flood_probability * 100);
      const newPrediction = {
        probability: probabilityPct,
        riskLevel: result.risk_level,
        predictionTime: new Date().toLocaleString(),
        location,
        rainfall24h: environment.rainfall24h?.toFixed(2) ?? "—",
      };

      setPrediction(newPrediction);
      setPredictionDone(true);

      // Save to recent history
      const updated = [newPrediction, ...recentPredictions].slice(0, 10);
      setRecentPredictions(updated);
      localStorage.setItem("recentPredictions", JSON.stringify(updated));

    } catch (err) {
      setPredictionError(err.message || "Prediction failed. Please check the backend.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleNavigation = (page) => { if (onNavigate) onNavigate(page); };

  const fmt = (v, dec = 1) => (v !== null && v !== undefined ? Number(v).toFixed(dec) : "—");

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div className="prediction-page">

      <Sidebar activePage="prediction" onNavigate={handleNavigation} />

      <div className="prediction-main">

        {/* HEADER */}
        <Navbar 
          title="Prediction" 
          subtitle="Predict flash flood risk for any location" 
        />

        {/* CONTENT */}
        <main className="prediction-content">
          <div className="prediction-columns">

            {/* =================================================
                LEFT COLUMN
            ================================================= */}
            <section className="prediction-left">
              <div className="prediction-card input-card">

                <div className="section-heading">
                  <div className="step-number">1</div>
                  <div>
                    <h2>Input Parameters</h2>
                    <p>Select location and review environmental conditions</p>
                  </div>
                </div>

                {/* LOCATION SEARCH */}
                <div className="location-section">
                  <label>Select Location</label>
                  <div className="location-input-row">
                    <div className="location-input">
                      <Search size={18} />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleLocationSearch(); }}
                        placeholder="Search or click map..."
                      />
                      <button onClick={() => setLocation("")}><X size={17} /></button>
                    </div>
                    <button
                      className="locate-button"
                      onClick={handleLocationSearch}
                      disabled={searchingLocation}
                      title="Search location"
                    >
                      <Navigation size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                    💡 Coverage: Selected Region region (lat 29–32°N, lon 78–81°E). Click the map to auto-fill data.
                  </p>
                </div>

                {/* MAP */}
                <div className="prediction-map">
                  <MapContainer
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={10}
                    scrollWheelZoom={true}
                    className="prediction-leaflet-map"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController coordinates={coordinates} />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <Marker position={[coordinates.lat, coordinates.lng]}>
                      <Popup>
                        <strong>{location}</strong><br />
                        {coordinates.lat.toFixed(5)}°N, {coordinates.lng.toFixed(5)}°E
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                {/* FEATURES STATUS BANNER */}
                {featuresStatus === "loading" && (
                  <div style={{ padding: "10px", background: "#eff6ff", borderRadius: "8px", fontSize: "13px", color: "#1d4ed8", marginTop: "12px" }}>
                    ⏳ Loading terrain and rainfall data...
                  </div>
                )}
                {featuresStatus === "outside" && (
                  <div style={{ padding: "10px", background: "#fff7ed", borderRadius: "8px", fontSize: "13px", color: "#c2410c", marginTop: "12px" }}>
                    ⚠️ {featuresError}<br />
                    <small>Please select a location inside Selected Region (lat 29–32°N, lon 78–81°E).</small>
                  </div>
                )}
                {featuresStatus === "error" && (
                  <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "8px", fontSize: "13px", color: "#dc2626", marginTop: "12px" }}>
                    ❌ {featuresError}
                  </div>
                )}
                {featuresStatus === "loaded" && (
                  <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: "8px", fontSize: "13px", color: "#15803d", marginTop: "12px" }}>
                    ✅ Terrain and rainfall data loaded successfully.
                  </div>
                )}

                {/* ENVIRONMENT CARDS */}
                <div className="environment-section">
                  <h3>Environmental Conditions</h3>
                  <div className="environment-grid">
                    <EnvironmentCard icon={<CloudRain />} label="Current Rainfall" value={fmt(environment.rainfallCurrent, 2)} unit="mm/hr" />
                    <EnvironmentCard icon={<CloudRain />} label="Rainfall (1H)" value={fmt(environment.rainfall1h, 2)} unit="mm" />
                    <EnvironmentCard icon={<CloudRain />} label="Rainfall (3H)" value={fmt(environment.rainfall3h, 2)} unit="mm" />
                    <EnvironmentCard icon={<CloudRain />} label="Rainfall (6H)" value={fmt(environment.rainfall6h, 2)} unit="mm" />
                    <EnvironmentCard icon={<CloudRain />} label="Rainfall (24H)" value={fmt(environment.rainfall24h, 2)} unit="mm" />
                    <EnvironmentCard icon={<Mountain />} label="Elevation" value={fmt(environment.elevation, 0)} unit="m" />
                    <EnvironmentCard icon={<Mountain />} label="Slope" value={fmt(environment.slope, 2)} unit="°" />
                    <EnvironmentCard icon={<Waves />} label="Rainfall Change" value={fmt(environment.rainfallChange, 3)} unit="mm/hr" />
                  </div>
                </div>

                {/* PREDICT BUTTON */}
                <button
                  className="predict-button"
                  onClick={handlePredict}
                  disabled={isPredicting || featuresStatus !== "loaded"}
                >
                  {isPredicting ? (
                    <><RefreshCw size={18} className="predict-spinner" /> Analyzing...</>
                  ) : (
                    <>Predict Flood Risk <ArrowRight size={19} /></>
                  )}
                </button>

                {predictionError && (
                  <div style={{ marginTop: "10px", color: "#dc2626", fontSize: "13px" }}>
                    ❌ {predictionError}
                  </div>
                )}

                <div className="model-note">
                  <ShieldCheck size={14} />
                  Random Forest model — 9 terrain &amp; rainfall features
                </div>
              </div>
            </section>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}
            <section className="prediction-right">
              {predictionDone && prediction ? (
                <>
                  {/* RESULT CARD */}
                  <div className="prediction-card result-card">
                    <div className="section-heading result-heading">
                      <div className="step-number green">2</div>
                      <div>
                        <h2>Prediction Result</h2>
                        <p>AI model analysis and risk assessment</p>
                      </div>
                      <span className="completed-badge">Completed</span>
                    </div>

                    <div className="result-body">
                      <div className="result-score">
                        <span className="result-label">Flood Probability</span>
                        <strong>{prediction.probability}%</strong>
                        <h3>
                          {prediction.riskLevel === "HIGH" && "High Risk of Flood"}
                          {prediction.riskLevel === "MEDIUM" && "Moderate Risk of Flood"}
                          {prediction.riskLevel === "LOW" && "Low Risk of Flood"}
                        </h3>
                        <span className={`high-badge risk-${prediction.riskLevel?.toLowerCase()}`}>
                          {prediction.riskLevel === "HIGH" && <AlertTriangle size={15} />}
                          {prediction.riskLevel === "MEDIUM" && <AlertTriangle size={15} />}
                          {prediction.riskLevel === "LOW" && <CheckCircle size={15} />}
                          {prediction.riskLevel}
                        </span>
                      </div>

                      {/* GAUGE */}
                      <div className="risk-gauge-wrapper">
                        <div className="gauge">
                          <div className="gauge-track" />
                          <div
                            className="gauge-pointer"
                            style={{ "--gauge-val": `${prediction.probability}%` }}
                          >
                            <div />
                          </div>
                          <span className="gauge-value value-0">0%</span>
                          <span className="gauge-value value-25">25%</span>
                          <span className="gauge-value value-50">50%</span>
                          <span className="gauge-value value-75">75%</span>
                          <span className="gauge-value value-100">100%</span>
                        </div>
                        <span className="prediction-time">Prediction Time: {prediction.predictionTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* EXPLANATION */}
                  <div className="prediction-card explanation-card">
                    <div>
                      <h2>Risk Level Explanation</h2>
                      <p>
                        {prediction.riskLevel === "HIGH" &&
                          "There is a high probability of flash flooding in this area. Heavy rainfall and terrain conditions are the main contributing factors. Take immediate precautions."}
                        {prediction.riskLevel === "MEDIUM" &&
                          "There is a moderate probability of flooding. Monitor rainfall closely and be prepared to act on local authority guidance."}
                        {prediction.riskLevel === "LOW" &&
                          "Current conditions indicate a low flood risk. Continue monitoring weather updates as conditions can change rapidly."}
                      </p>
                    </div>
                    <div className="flood-illustration">
                      <div className="cloud-shape">☁</div>
                      <div className="house-shape">🏠</div>
                      <div className="water-shape">≋≋≋</div>
                    </div>
                  </div>

                  {/* CONTRIBUTING FACTORS */}
                  <div className="prediction-card factors-card">
                    <div className="factors-heading">
                      <h2>Top Contributing Factors</h2>
                      <span>Impact <Info size={13} /></span>
                    </div>
                    <Factor name="Rainfall (24H)" value={Math.min(Math.round((environment.rainfall24h ?? 0) / 2), 100)} type="critical" />
                    <Factor name="Rainfall (6H)" value={Math.min(Math.round((environment.rainfall6h ?? 0) / 1.5), 100)} type="high" />
                    <Factor name="Elevation" value={Math.min(Math.round((environment.elevation ?? 0) / 50), 100)} type="moderate" />
                    <Factor name="Slope" value={Math.min(Math.round((environment.slope ?? 0) * 2.5), 100)} type="moderate" />
                    <Factor name="Rainfall Change" value={Math.min(Math.round(Math.abs(environment.rainfallChange ?? 0) * 10), 100)} type="low" />
                  </div>

                  {/* RECOMMENDED ACTIONS */}
                  <div className="prediction-card actions-card">
                    <div className="actions-list">
                      <h2>Recommended Actions</h2>
                      {getActions(prediction.riskLevel).map((text, i) => (
                        <Action key={i} text={text} />
                      ))}
                    </div>
                    <div className="risk-guide">
                      <h3>Risk Level Guide</h3>
                      <div className="guide-risk">
                        <span className="guide-icon"><AlertTriangle size={15} /></span>
                        <strong>High (&ge; 70%)</strong>
                      </div>
                      <p>Immediate precautions required. Flooding likely in low-lying areas.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="prediction-card prediction-empty">
                  <div className="prediction-empty-content">
                    <div className="prediction-empty-icon"><ShieldCheck size={34} /></div>
                    <h2>Ready to <span>Predict</span></h2>
                    <p>
                      {featuresStatus === "loaded"
                        ? <>Click <strong>Predict Flood Risk</strong> to analyze the current conditions.</>
                        : featuresStatus === "outside" || featuresStatus === "error"
                        ? "Please select a location within the coverage area first."
                        : <>Select a location and click <strong>Predict Flood Risk</strong> to analyze the current flood risk.</>
                      }
                    </p>
                    {isPredicting && (
                      <div className="prediction-loading">
                        <div className="prediction-spinner"></div>
                        <strong>Predicting flood risk...</strong>
                        <span>Analyzing environmental data and running AI model...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RECENT PREDICTIONS TABLE */}
          <section className="prediction-card recent-card">
            <div className="recent-header">
              <h2>Recent Predictions</h2>
              <button onClick={() => {
                setRecentPredictions([]);
                localStorage.removeItem("recentPredictions");
              }}>Clear History</button>
            </div>

            <div className="prediction-table-wrapper">
              {recentPredictions.length === 0 ? (
                <p style={{ padding: "20px", color: "#9ca3af", textAlign: "center" }}>No predictions yet. Run a prediction to see results here.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Date &amp; Time</th>
                      <th>Probability</th>
                      <th>Risk Level</th>
                      <th>Rainfall (24H)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPredictions.map((p, i) => (
                      <tr key={i}>
                        <td>{p.location}</td>
                        <td>{p.predictionTime}</td>
                        <td className="table-probability">{p.probability}%</td>
                        <td>
                          <span className={`table-risk ${p.riskLevel?.toLowerCase()}`}>
                            {p.riskLevel}
                          </span>
                        </td>
                        <td>{p.rainfall24h !== undefined ? `${p.rainfall24h} mm` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function EnvironmentCard({ icon, label, value, unit }) {
  return (
    <div className="environment-condition-card">
      <div className="condition-title">
        <span className="condition-icon">{React.cloneElement(icon, { size: 17 })}</span>
        <strong>{label}</strong>
      </div>
      <div className="condition-value">
        <b>{value}</b>
        <span>{unit}</span>
      </div>
    </div>
  );
}

function Factor({ name, value, type }) {
  return (
    <div className="factor-row">
      <span className="factor-name">{name}</span>
      <div className="factor-bar">
        <div className={`factor-fill ${type}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

function Action({ text }) {
  return (
    <div className="action-row">
      <span><Check size={13} /></span>
      <p>{text}</p>
    </div>
  );
}

export default Prediction;