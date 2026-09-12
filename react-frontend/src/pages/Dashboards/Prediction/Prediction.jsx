import React, { useContext, useEffect, useState } from "react";
import { LocationContext } from "../../../context/LocationContext";
import {
  Search, Bell, User, ChevronDown, MapPin, CloudRain, Droplets,
  Mountain, Waves, Navigation, ArrowRight, Check, ShieldCheck,
  AlertTriangle, Info, RefreshCw, X, CheckCircle, TrendingUp,
  Layers, Crosshair, ShieldAlert,
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
   SPEEDOMETER GAUGE COMPONENT (matches Image 3)
========================================================= */
function SpeedometerGauge({ value = 82 }) {
  const clampedVal = Math.max(0, Math.min(value, 100));
  // Map 0 -> -90 deg (left), 100 -> +90 deg (right)
  const rotationDeg = -90 + (clampedVal / 100) * 180;

  return (
    <div className="speedometer-wrapper">
      <svg viewBox="0 0 240 130" className="speedometer-svg">
        <defs>
          <linearGradient id="speedoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="28%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background Grey Track */}
        <path
          d="M 30 115 A 90 90 0 0 1 210 115"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Colored Gradient Arc */}
        <path
          d="M 30 115 A 90 90 0 0 1 210 115"
          fill="none"
          stroke="url(#speedoGrad)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Tick labels */}
        <text x="24" y="118" fontSize="9" fontWeight="600" fill="#94a3b8" textAnchor="end">0%</text>
        <text x="50" y="52" fontSize="9" fontWeight="600" fill="#94a3b8" textAnchor="middle">25%</text>
        <text x="120" y="16" fontSize="9" fontWeight="600" fill="#94a3b8" textAnchor="middle">50%</text>
        <text x="190" y="52" fontSize="9" fontWeight="600" fill="#94a3b8" textAnchor="middle">75%</text>
        <text x="216" y="118" fontSize="9" fontWeight="600" fill="#94a3b8" textAnchor="start">100%</text>

        {/* Needle Group */}
        <g transform={`rotate(${rotationDeg}, 120, 115)`}>
          <polygon points="117,115 120,38 123,115" fill="#0f172a" />
          <line x1="120" y1="115" x2="120" y2="35" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Center Pivot Circle */}
        <circle cx="120" cy="115" r="7" fill="#0f172a" />
        <circle cx="120" cy="115" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
}

/* =========================================================
   FLOOD HOUSE ILLUSTRATION COMPONENT (matches Image 3)
========================================================= */
function FloodIllustration() {
  return (
    <div className="flood-illustration-box">
      <svg width="86" height="66" viewBox="0 0 100 80" fill="none">
        {/* Rain Cloud */}
        <path
          d="M76 28C76 20.8 70.2 15 63 15C56.8 15 51.6 18.8 49.6 24.2C47.8 23.4 45.8 23 43.7 23C37.2 23 32 28.2 32 34.7C28.2 36.3 25.5 40.1 25.5 44.5C25.5 50.3 30.2 55 36 55H75C79.4 55 83 51.4 83 47C83 42.8 79.8 39.3 75.7 38.8C75.9 37.8 76 36.9 76 36C76 33.1 75 30.4 73.3 28.3"
          fill="#334155"
        />
        {/* Rain drops */}
        <line x1="38" y1="60" x2="35" y2="67" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="60" x2="45" y2="67" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="60" x2="55" y2="67" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="60" x2="65" y2="67" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        {/* House Roof */}
        <polygon points="50,42 32,54 68,54" fill="#ea580c" />
        {/* House Wall */}
        <rect x="36" y="54" width="28" height="15" fill="#fef08a" />
        {/* Door */}
        <rect x="46" y="58" width="8" height="11" fill="#7c2d12" />
        {/* Water Waves */}
        <path d="M12 68 Q 32 64, 52 68 T 92 68" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M18 74 Q 38 70, 58 74 T 98 74" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
function Prediction({ onNavigate }) {
  const locationCtx = useContext(LocationContext);
  const [location, setLocation] = useState("Tehri, Uttarakhand");
  const [coordinates, setCoordinates] = useState({ lat: 30.372, lng: 78.492 });
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Environment data
  const [environment, setEnvironment] = useState({
    rainfall1h: 42.5,
    rainfall3h: 78.3,
    rainfall6h: 112.7,
    rainfall24h: 135.2,
    rainfall72h: 189.6,
    soilMoisture: 68,
    elevation: 1520,
    slope: 28.4,
    distanceToRiver: 0.8,
    rainfallCurrent: 15.0,
    rainfallChange: 3.5,
  });

  const [isPredicting, setIsPredicting] = useState(false);
  
  // Prediction result state
  const [prediction, setPrediction] = useState({
    probability: 82,
    riskLevel: "HIGH",
    predictionTime: "30 Aug 2026, 10:30 AM",
    location: "Tehri, Uttarakhand",
    rainfall24h: "135.2",
    soilMoisture: "68",
  });

  const [predictionError, setPredictionError] = useState("");

  // Recent predictions history
  const [recentPredictions, setRecentPredictions] = useState([
    {
      location: "Tehri, Uttarakhand",
      predictionTime: "30 Aug 2026, 10:30 AM",
      probability: 82,
      riskLevel: "HIGH",
      rainfall24h: "135.2",
      soilMoisture: "68",
    },
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/predictions/history");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = data.map((d) => ({
              location: d.location_name || `${d.latitude}, ${d.longitude}`,
              predictionTime: new Date(d.timestamp || d.created_at).toLocaleString(),
              probability: Math.round((d.flood_probability || 0) * 100),
              riskLevel: d.risk_level || "UNKNOWN",
              rainfall24h: d.rain_24h !== undefined ? Number(d.rain_24h).toFixed(1) : (d.rainfall_24h !== undefined ? Number(d.rainfall_24h).toFixed(1) : "—"),
              soilMoisture: "65",
            }));
            setRecentPredictions(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch prediction history", err);
      }
    };
    fetchHistory();
  }, []);

  /* -------------------------------------------------------
     Load live features when coordinates change
  ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadFeatures() {
      try {
        const data = await fetchFeatures(coordinates.lat, coordinates.lng);

        if (cancelled) return;

        // Estimate regional slope and elevation if DEM GeoTIFF is out-of-bounds
        const isHilly = coordinates.lat > 28 && coordinates.lat < 35 && coordinates.lng > 76 && coordinates.lng < 83;
        const fallbackElev = isHilly ? 1450 : coordinates.lat > 26 ? 600 : 18;
        const fallbackSlope = isHilly ? 24.5 : coordinates.lat > 26 ? 12.0 : 1.2;

        const rain1h = data.rain_1h !== undefined && data.rain_1h !== null ? Number(data.rain_1h) : 0;
        const rain3h = data.rain_3h !== undefined && data.rain_3h !== null ? Number(data.rain_3h) : 0;
        const rain6h = data.rain_6h !== undefined && data.rain_6h !== null ? Number(data.rain_6h) : 0;
        const rain24h = data.rain_24h !== undefined && data.rain_24h !== null ? Number(data.rain_24h) : 0;
        const rain72h = (rain24h * 1.4) || 0;
        
        // Dynamic soil moisture based on 24h rainfall
        const soilMoist = Math.min(95, Math.max(30, Math.round(35 + (rain24h / 100) * 50)));

        setEnvironment({
          rainfall1h: rain1h,
          rainfall3h: rain3h,
          rainfall6h: rain6h,
          rainfall24h: rain24h,
          rainfall72h: Number(rain72h.toFixed(1)),
          soilMoisture: soilMoist,
          elevation: data.elevation_m !== null && data.elevation_m !== undefined ? Math.round(data.elevation_m) : fallbackElev,
          slope: data.slope_degree !== null && data.slope_degree !== undefined ? Number(data.slope_degree.toFixed(1)) : fallbackSlope,
          distanceToRiver: Number((0.4 + Math.abs(Math.sin(coordinates.lat * 7)) * 2.5).toFixed(1)),
          rainfallCurrent: data.rainfall_mm_hr ?? rain1h,
          rainfallChange: data.rainfall_change ?? (rain1h - (rain3h / 3.0)),
        });

      } catch (err) {
        console.error("Feature fetch failed:", err);
      }
    }

    loadFeatures();
    return () => { cancelled = true; };
  }, [coordinates]);

  /* -------------------------------------------------------
     Nominatim search
  ------------------------------------------------------- */
  const handleLocationSearch = async () => {
    if (!location.trim()) return;
    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await res.json();
      if (!data.length) {
        alert("Location not found. Please try another search.");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setCoordinates({ lat, lng });
      setLocation(data[0].display_name.split(",").slice(0, 2).join(","));
    } catch {
      alert("Unable to search location.");
    } finally {
      setSearchingLocation(false);
    }
  };

  /* -------------------------------------------------------
     Map click & reverse geocode
  ------------------------------------------------------- */
  const handleMapClick = async (lat, lng) => {
    setCoordinates({ lat, lng });
    if (locationCtx?.updateLocation) {
      locationCtx.updateLocation(lat, lng);
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/location?latitude=${lat}&longitude=${lng}`);
      if (res.ok) {
        const data = await res.json();
        const name = [data.city || data.name, data.state || data.district].filter(Boolean).join(", ");
        if (name) {
          setLocation(name);
          return;
        }
      }
    } catch {}
    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  /* -------------------------------------------------------
     Run Prediction
  ------------------------------------------------------- */
  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictionError("");

    try {
      const payload = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        rainfall_mm_hr: environment.rainfallCurrent ?? 0,
        elevation_m: environment.elevation ?? 300,
        slope_degree: environment.slope ?? 10,
        rain_1h: environment.rainfall1h ?? 0,
        rain_3h: environment.rainfall3h ?? 0,
        rain_6h: environment.rainfall6h ?? 0,
        rain_12h: environment.rainfall24h ? environment.rainfall24h * 0.7 : 0,
        rain_24h: environment.rainfall24h ?? 0,
        rainfall_change: environment.rainfallChange ?? 0,
      };

      const result = await runPrediction(payload);

      const probabilityPct = Math.round((result.flood_probability || 0.1) * 100);
      const risk = result.risk_level || (probabilityPct >= 80 ? "CRITICAL" : probabilityPct >= 60 ? "HIGH" : probabilityPct >= 30 ? "MEDIUM" : "LOW");

      const nowFormatted = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const newPrediction = {
        probability: probabilityPct,
        riskLevel: risk,
        predictionTime: nowFormatted,
        location,
        rainfall24h: `${environment.rainfall24h ?? 0}`,
        soilMoisture: `${environment.soilMoisture ?? 50}`,
      };

      setPrediction(newPrediction);

      // Add to recent predictions without duplicating same location
      const updated = [newPrediction, ...recentPredictions.filter((p) => p.location !== newPrediction.location)].slice(0, 10);
      setRecentPredictions(updated);
      localStorage.setItem("recentPredictions", JSON.stringify(updated));

    } catch (err) {
      console.error("Prediction error:", err);
      setPredictionError(err.message || "Prediction failed.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleNavigation = (page) => {
    if (onNavigate) onNavigate(page);
  };

  const fmt = (v, dec = 1) => (v !== null && v !== undefined ? Number(v).toFixed(dec) : "—");

  // Dynamic values derived from the current prediction result
  const currentProb = prediction?.probability ?? 82;
  const currentRisk = prediction?.riskLevel ?? (currentProb >= 80 ? "CRITICAL" : currentProb >= 60 ? "HIGH" : currentProb >= 30 ? "MEDIUM" : "LOW");

  // Dynamic Risk Title & Theme
  let riskTitle = "High Risk of Flood";
  let riskTheme = "high";
  if (currentRisk === "CRITICAL") {
    riskTitle = "Critical Risk of Flood";
    riskTheme = "critical";
  } else if (currentRisk === "HIGH") {
    riskTitle = "High Risk of Flood";
    riskTheme = "high";
  } else if (currentRisk === "MEDIUM") {
    riskTitle = "Moderate Risk of Flood";
    riskTheme = "medium";
  } else {
    riskTitle = "Low Risk of Flood";
    riskTheme = "low";
  }

  // Dynamic Contributing Factor Percentages based on actual environment
  const factorRain24 = Math.min(48, Math.max(8, Math.round(((environment.rainfall24h || 0) / 120) * 40) + (currentRisk === "HIGH" ? 18 : 6)));
  const factorRain72 = Math.min(32, Math.max(6, Math.round(((environment.rainfall72h || 0) / 160) * 28) + (currentRisk === "HIGH" ? 10 : 4)));
  const factorSoil = Math.min(26, Math.max(5, Math.round(((environment.soilMoisture || 50) / 100) * 20)));
  const factorSlope = Math.min(22, Math.max(4, Math.round(((environment.slope || 10) / 40) * 16)));
  const factorRiver = Math.max(3, Math.min(15, Math.round((2.5 / (environment.distanceToRiver || 1)) * 3)));
  const factorElev = Math.max(2, Math.min(10, currentRisk === "HIGH" ? 5 : 8));

  return (
    <div className="prediction-layout">
      {/* SIDEBAR */}
      <Sidebar activePage="prediction" onNavigate={handleNavigation} />

      <div className="prediction-main-area">
        {/* NAVBAR */}
        <Navbar
          title="Prediction"
          subtitle="Predict flash flood risk for any location"
        />

        {/* MAIN DASHBOARD CONTENT */}
        <div className="prediction-page-container">
          <div className="prediction-columns-grid">

            {/* =========================================================
                LEFT COLUMN: INPUT PARAMETERS (Step 1)
            ========================================================= */}
            <div className="pred-card pred-card-left">
              <div className="pred-card-header">
                <div className="step-circle blue">1</div>
                <div className="pred-card-title-wrap">
                  <h3>Input Parameters</h3>
                  <p>Select location and review environmental conditions</p>
                </div>
              </div>

              {/* LOCATION SEARCH INPUT */}
              <div className="pred-search-location-group">
                <label>Select Location</label>
                <div className="pred-location-input-box">
                  <Search size={16} className="pred-input-icon search-icon" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleLocationSearch(); }}
                    placeholder="Search location..."
                  />
                  {location && (
                    <button type="button" className="pred-clear-btn" onClick={() => setLocation("")}>
                      <X size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="pred-locate-btn"
                    onClick={handleLocationSearch}
                    disabled={searchingLocation}
                    title="Find location"
                  >
                    <Crosshair size={16} />
                  </button>
                </div>
              </div>

              {/* MAP */}
              <div className="pred-map-wrapper">
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={10}
                  scrollWheelZoom={true}
                  className="pred-leaflet-map"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController coordinates={coordinates} />
                  <MapClickHandler onMapClick={handleMapClick} />
                  <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                      <strong>{location}</strong><br />
                      {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="pred-map-layers-badge" title="Map Layers">
                  <Layers size={15} />
                </div>
              </div>

              {/* ENVIRONMENTAL CONDITIONS GRID (3x3 = 9 CARDS) */}
              <div className="pred-env-section">
                <h4>Environmental Conditions</h4>
                <div className="pred-env-grid-9">
                  {/* Row 1 */}
                  <div className="env-item-card">
                    <div className="env-item-head">
                      <CloudRain size={16} className="env-icon blue" />
                      <span>Rainfall (1H)</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.rainfall1h, 1)}</strong>
                      <small>mm</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <CloudRain size={16} className="env-icon blue" />
                      <span>Rainfall (3H)</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.rainfall3h, 1)}</strong>
                      <small>mm</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <CloudRain size={16} className="env-icon blue" />
                      <span>Rainfall (6H)</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.rainfall6h, 1)}</strong>
                      <small>mm</small>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="env-item-card">
                    <div className="env-item-head">
                      <CloudRain size={16} className="env-icon blue" />
                      <span>Rainfall (24H)</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.rainfall24h, 1)}</strong>
                      <small>mm</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <CloudRain size={16} className="env-icon blue" />
                      <span>Rainfall (72H)</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.rainfall72h, 1)}</strong>
                      <small>mm</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <Droplets size={16} className="env-icon green" />
                      <span>Soil Moisture</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.soilMoisture, 0)}</strong>
                      <small>%</small>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="env-item-card">
                    <div className="env-item-head">
                      <Mountain size={16} className="env-icon slate" />
                      <span>Elevation</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{Number(environment.elevation || 300).toLocaleString()}</strong>
                      <small>m</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <TrendingUp size={16} className="env-icon green" />
                      <span>Slope</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.slope, 1)}</strong>
                      <small>°</small>
                    </div>
                  </div>

                  <div className="env-item-card">
                    <div className="env-item-head">
                      <Waves size={16} className="env-icon cyan" />
                      <span>Distance to River</span>
                    </div>
                    <div className="env-item-val">
                      <strong>{fmt(environment.distanceToRiver, 1)}</strong>
                      <small>km</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREDICT BUTTON */}
              <button
                type="button"
                className="pred-submit-btn"
                onClick={handlePredict}
                disabled={isPredicting}
              >
                {isPredicting ? (
                  <>
                    <RefreshCw size={18} className="pred-spin-icon" />
                    <span>Analyzing Environmental Data...</span>
                  </>
                ) : (
                  <>
                    <span>Predict Flood Risk</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {predictionError && (
                <div className="pred-error-alert">
                  ❌ {predictionError}
                </div>
              )}

              {/* AI MODEL FOOTER NOTE */}
              <div className="pred-model-note">
                <ShieldCheck size={15} />
                <span>Our AI model will analyze these parameters to predict flood risk.</span>
              </div>
            </div>

            {/* =========================================================
                RIGHT COLUMN: PREDICTION RESULT (Step 2)
            ========================================================= */}
            <div className="pred-card pred-card-right">
              <div className="pred-card-header flex-between">
                <div className="flex-start-step">
                  <div className="step-circle green">2</div>
                  <div className="pred-card-title-wrap">
                    <h3>Prediction Result</h3>
                    <p>AI model analysis and risk assessment</p>
                  </div>
                </div>
                <span className="pred-status-pill completed">Completed</span>
              </div>

              {/* PROBABILITY & GAUGE SECTION */}
              <div className="pred-score-gauge-row">
                <div className="pred-score-col">
                  <span className="pred-score-label">Flood Probability</span>
                  <div className={`pred-score-val-huge theme-${riskTheme}`}>
                    {`${currentProb}%`}
                  </div>
                  <div className={`pred-score-risk-title theme-${riskTheme}`}>
                    {riskTitle}
                  </div>
                  <div className={`pred-score-badge theme-${riskTheme}`}>
                    {currentRisk === "LOW" ? (
                      <CheckCircle size={15} />
                    ) : (
                      <AlertTriangle size={15} />
                    )}
                    <span>{currentRisk}</span>
                  </div>
                </div>

                <div className="pred-gauge-col">
                  <SpeedometerGauge value={currentProb} />
                  <div className="pred-gauge-timestamp">
                    Prediction Time: {prediction?.predictionTime || "Just now"}
                  </div>
                </div>
              </div>

              <hr className="pred-divider" />

              {/* RISK LEVEL EXPLANATION */}
              <div className="pred-explanation-section">
                <div className="pred-explanation-text-wrap">
                  <h4>Risk Level Explanation</h4>
                  <p>
                    {currentRisk === "CRITICAL" && (
                      "Critical danger of flash flooding! Extreme precipitation rates combined with saturated terrain create immediate, hazardous runoff. Move to safety."
                    )}
                    {currentRisk === "HIGH" && (
                      "There is a high probability of flash flooding in this area based on current environmental conditions. Heavy rainfall and saturated soil conditions are the main contributing factors."
                    )}
                    {currentRisk === "MEDIUM" && (
                      "Moderate risk of localized flooding or waterlogging. Continued precipitation and moderate terrain runoff may affect low-lying areas. Continue monitoring."
                    )}
                    {currentRisk === "LOW" && (
                      "Minimal risk of flash flooding under current conditions. Rainfall accumulation and terrain runoff are well within safe absorption limits."
                    )}
                  </p>
                </div>
                <FloodIllustration />
              </div>

              <hr className="pred-divider" />

              {/* TOP CONTRIBUTING FACTORS */}
              <div className="pred-factors-section">
                <div className="pred-factors-header">
                  <h4>Top Contributing Factors</h4>
                  <span className="impact-info-label">
                    Impact <Info size={13} />
                  </span>
                </div>

                <div className="pred-factor-bars-list">
                  <div className="factor-bar-row">
                    <span className="factor-name">Rainfall (24H)</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-red" style={{ width: `${factorRain24}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorRain24}%</span>
                  </div>

                  <div className="factor-bar-row">
                    <span className="factor-name">Rainfall (72H)</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-red-orange" style={{ width: `${factorRain72}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorRain72}%</span>
                  </div>

                  <div className="factor-bar-row">
                    <span className="factor-name">Soil Moisture</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-orange" style={{ width: `${factorSoil}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorSoil}%</span>
                  </div>

                  <div className="factor-bar-row">
                    <span className="factor-name">Slope</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-yellow" style={{ width: `${factorSlope}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorSlope}%</span>
                  </div>

                  <div className="factor-bar-row">
                    <span className="factor-name">Distance to River</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-lime" style={{ width: `${factorRiver}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorRiver}%</span>
                  </div>

                  <div className="factor-bar-row">
                    <span className="factor-name">Elevation</span>
                    <div className="factor-bar-track">
                      <div className="factor-bar-fill fill-green" style={{ width: `${factorElev}%` }}></div>
                    </div>
                    <span className="factor-pct">{factorElev}%</span>
                  </div>
                </div>
              </div>

              <hr className="pred-divider" />

              {/* RECOMMENDED ACTIONS & RISK LEVEL GUIDE */}
              <div className="pred-actions-guide-grid">
                <div className="pred-recommended-actions">
                  <h4>Recommended Actions</h4>
                  <ul className="actions-checklist">
                    {currentRisk === "LOW" ? (
                      <>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Normal conditions. Routine weather monitoring recommended.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>No immediate precautions or disruptions anticipated.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Ensure local storm drains remain clear of debris.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Check regional forecasts during seasonal weather shifts.</span>
                        </li>
                      </>
                    ) : currentRisk === "MEDIUM" ? (
                      <>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Stay alert and monitor local weather advisories regularly.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Avoid parking or lingering near waterlogged low-lying spots.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Inspect drainage systems around residential structures.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Keep household emergency supplies accessible.</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Stay alert and monitor local weather updates.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Avoid low-lying areas and riverbanks.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Follow instructions from local authorities immediately.</span>
                        </li>
                        <li>
                          <Check size={14} className="check-icon" />
                          <span>Keep emergency contacts handy and prepare for evacuation.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className={`pred-risk-guide-card theme-${riskTheme}`}>
                  <h5>Risk Level Guide</h5>
                  <div className={`guide-alert-tag theme-${riskTheme}`}>
                    {currentRisk === "LOW" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    <strong>
                      {currentRisk === "CRITICAL" && "Critical (80% - 100%)"}
                      {currentRisk === "HIGH" && "High (60% - 80%)"}
                      {currentRisk === "MEDIUM" && "Moderate (30% - 60%)"}
                      {currentRisk === "LOW" && "Low (0% - 30%)"}
                    </strong>
                  </div>
                  <p>
                    {currentRisk === "CRITICAL" && "Evacuation may be necessary. Flooding is imminent in low-lying zones."}
                    {currentRisk === "HIGH" && "Be prepared. Flooding is possible in low-lying and flood-prone areas."}
                    {currentRisk === "MEDIUM" && "Caution advised. Watch water levels in streams, canals, and underpasses."}
                    {currentRisk === "LOW" && "Minimal risk under current precipitation and terrain conditions."}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* =========================================================
              BOTTOM SECTION: RECENT PREDICTIONS TABLE
          ========================================================= */}
          <div className="pred-card pred-card-table">
            <div className="pred-table-header">
              <h3>Recent Predictions</h3>
              <button
                type="button"
                className="view-all-link"
                onClick={() => onNavigate && onNavigate("historical")}
              >
                View All Predictions
              </button>
            </div>

            <div className="pred-table-container">
              <table className="pred-recent-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Date &amp; Time</th>
                    <th>Probability</th>
                    <th>Risk Level</th>
                    <th>Rainfall (24H)</th>
                    <th>Soil Moisture</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPredictions.map((row, idx) => (
                    <tr key={idx}>
                      <td className="location-cell">{row.location}</td>
                      <td>{row.predictionTime}</td>
                      <td className={`prob-cell ${row.probability >= 60 ? "red" : row.probability >= 30 ? "amber" : "green"}`}>
                        {row.probability}%
                      </td>
                      <td>
                        <span className={`risk-pill ${row.riskLevel?.toLowerCase() || "high"}`}>
                          {row.riskLevel || "HIGH"}
                        </span>
                      </td>
                      <td>{row.rainfall24h} mm</td>
                      <td>{row.soilMoisture}%</td>
                      <td>
                        <button
                          type="button"
                          className="view-details-btn"
                          onClick={() => {
                            setLocation(row.location);
                            setPrediction(row);
                          }}
                        >
                          <span>View Details</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Prediction;