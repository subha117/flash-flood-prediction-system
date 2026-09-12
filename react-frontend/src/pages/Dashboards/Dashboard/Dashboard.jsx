import React, { useContext } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import { CloudRain, Droplets, Bell, Clock3, ShieldAlert, Thermometer, Wind } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationContext } from "../../../context/LocationContext";
import { AuthContext } from "../../../context/AuthContext";
import { convertUnits, formatValueOnly, getUnitSymbol } from "../../../utils/units";
import "./Dashboard.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, updateLocation }) {
  const map = useMapEvents({
    click(e) {
      updateLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  React.useEffect(() => {
    if (position) map.flyTo(position, 10, { animate: true, duration: 1.5 });
  }, [position, map]);
  return position ? <Marker position={position} /> : null;
}

function AlertMarker({ alert, updateLocation }) {
  const isHighRisk = alert.risk_level === "CRITICAL" || alert.risk_level === "HIGH";
  
  // Create a red dot icon for alerts
  const alertIcon = L.divIcon({
    className: "custom-alert-marker",
    html: `<div style="background-color: ${isHighRisk ? '#dc2626' : '#d97706'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  return (
    <Marker 
      position={[alert.latitude, alert.longitude]} 
      icon={alertIcon}
      eventHandlers={{ click: () => updateLocation(alert.latitude, alert.longitude) }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <div style={{ textAlign: "center" }}>
          <strong>{alert.location_name}</strong><br/>
          <span style={{ color: isHighRisk ? "#dc2626" : "#d97706", fontWeight: "bold" }}>
            {alert.risk_level} RISK
          </span>
          <br/>
          Prob: {(alert.probability * 100).toFixed(1)}%
        </div>
      </Tooltip>
    </Marker>
  );
}

function Dashboard({ onNavigate }) {
  const ctx = useContext(LocationContext);
  const { settings } = useContext(AuthContext);
  const { location, weather, terrain, prediction, history, alerts, predictionHistory,
    loading, error, lastUpdate, apiOnline, updateLocation, refreshData } = ctx;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported by your browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        if (err.code === 1) alert("Location permission was denied. Please select a location on the map.");
        else if (err.code === 3) alert("Location request timed out. Please try again.");
        else alert("Unable to determine your location. Please select on the map.");
      },
      { timeout: 10000 }
    );
  };

  const terrainAvailable = terrain && terrain.available === true;
  const terrainUnavailable = terrain && terrain.available === false;

  const riskColor = prediction?.risk_level === "CRITICAL" ? "#991b1b" :
    prediction?.risk_level === "HIGH" ? "#dc2626" :
    prediction?.risk_level === "MEDIUM" ? "#d97706" : "#16a34a";

  const trend = history?.length >= 2
    ? (history[history.length - 1].rainfall > history[history.length - 2].rainfall * 1.2 ? "↑ Increasing"
      : history[history.length - 1].rainfall < history[history.length - 2].rainfall * 0.8 ? "↓ Decreasing" : "→ Stable")
    : "→ Stable";

  const activeAlertCount = alerts?.length || 0;

  // Use history directly (backend now returns exactly 7 days)
  const displayHistory = history || [];

  const getChartPath = () => {
    if (!displayHistory || displayHistory.length === 0) return { line: "", area: "" };
    const maxRain = Math.max(...displayHistory.map(h => h.rainfall || 0), 1);
    const w = 600, h = 220;
    const pts = displayHistory.map((item, i) => {
      const x = displayHistory.length > 1 ? (w / (displayHistory.length - 1)) * i : w / 2;
      // Add padding so line is not clipped at top (20px) or bottom (5px)
      const y = (h - 5) - (((item.rainfall || 0) / maxRain) * (h - 35));
      return `${x} ${y}`;
    });
    const linePath = pts.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(" ");
    return { line: linePath, area: linePath + ` L${w} ${h} L0 ${h} Z` };
  };
  const chartPaths = getChartPath();

  const fmt = (v, d = 2) => v != null && !isNaN(v) ? Number(v).toFixed(d) : "—";

  return (
    <div className="dashboard-page">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} />
      <div className="dashboard-main">
        <Navbar title="Dashboard" subtitle={`Overview of flood risk — ${location.name}, ${location.state}`} />

        <div className="last-updated" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Last Updated: {lastUpdate.toLocaleString()}</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem" }}>{apiOnline ? "🟢 API Online" : "🔴 API Offline"}</span>
            <button onClick={refreshData} disabled={loading} style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer", border: "1px solid #cbd5e1", background: loading ? "#e2e8f0" : "#fff" }}>
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {error && <div style={{ padding: "12px 24px", background: "#fef2f2", color: "#991b1b", borderBottom: "1px solid #fecaca" }}>{error}</div>}

        <main className="dashboard-content">
          {loading && !weather ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              <p style={{ fontSize: "1.1rem" }}>Loading dashboard data...</p>
              <p>Fetching weather, terrain, and rainfall for {location.name}...</p>
            </div>
          ) : (
            <>
              {/* TOP STAT CARDS */}
              <section className="top-stat-grid">
                {/* FLOOD RISK */}
                <div className="stat-card flood-risk-card">
                  <div className={`stat-icon ${prediction?.risk_level === "HIGH" || prediction?.risk_level === "CRITICAL" ? "red" : terrainUnavailable ? "gray" : "green"}`}>
                    <CloudRain size={27} />
                  </div>
                  <div className="stat-info">
                    <h4>FLOOD RISK</h4>
                    {prediction ? (
                      <>
                        <strong style={{ color: riskColor }}>{prediction.risk_level}</strong>
                        <b>{(prediction.flood_probability * 100).toFixed(1)}%</b>
                        <span>Probability</span>
                      </>
                    ) : terrainUnavailable ? (
                      <strong style={{ fontSize: "0.85rem", color: "#dc2626" }}>Terrain data unavailable</strong>
                    ) : (
                      <strong style={{ color: "#64748b" }}>Loading...</strong>
                    )}
                  </div>
                </div>

                {/* RAINFALL 24H */}
                <div className="stat-card">
                  <div className="stat-icon blue"><CloudRain size={27} /></div>
                  <div className="stat-info">
                    <h4>RAINFALL (24H)</h4>
                    <strong className="blue-text">{formatValueOnly(weather?.rain_24h, "rainfall", settings)}<small> {getUnitSymbol("rainfall", settings)}</small></strong>
                    <span className="increase">{trend}</span>
                    {weather?.data_source && <span style={{ fontSize: "0.7rem", background: weather.data_source === "LIVE" ? "#dcfce7" : "#fef3c7", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>{weather.data_source}</span>}
                  </div>
                </div>

                {/* TERRAIN STATUS */}
                <div className="stat-card">
                  <div className={`stat-icon ${terrainAvailable ? "green" : "gray"}`}><Droplets size={27} /></div>
                  <div className="stat-info">
                    <h4>TERRAIN</h4>
                    <strong style={{ color: terrainAvailable ? "#16a34a" : "#dc2626" }}>
                      {terrainAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                    </strong>
                    <span>{terrainAvailable ? `Elev: ${formatValueOnly(terrain.elevation_m, "elevation", settings)}${getUnitSymbol("elevation", settings)}, Slope: ${fmt(terrain.slope_degree, 1)}°` : "Outside DEM coverage"}</span>
                    {terrain?.source && <span style={{ fontSize: "0.7rem", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>{terrain.source}</span>}
                  </div>
                </div>

                {/* ACTIVE ALERTS */}
                <div className="stat-card">
                  <div className={`stat-icon ${activeAlertCount > 0 ? "alert-red" : "green"}`}><Bell size={27} /></div>
                  <div className="stat-info">
                    <h4>ACTIVE ALERTS</h4>
                    <strong className={activeAlertCount > 0 ? "red-text" : ""}>{activeAlertCount}</strong>
                    <span>{activeAlertCount > 0 ? "High Priority" : "No active alerts"}</span>
                  </div>
                </div>

                {/* LAST UPDATE */}
                <div className="stat-card">
                  <div className="stat-icon purple"><Clock3 size={27} /></div>
                  <div className="stat-info">
                    <h4>LAST UPDATE</h4>
                    <strong>{lastUpdate.toLocaleTimeString()}</strong>
                    <span>{lastUpdate.toLocaleDateString()}</span>
                  </div>
                </div>
              </section>

              {/* MIDDLE GRID - MAP + CHART */}
              <section className="dashboard-middle-grid">
                {/* MAP */}
                <div className="dashboard-panel risk-map-panel" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="panel-header">
                    <h2>Flood Risk Map ({location.name.split(",")[0]})</h2>
                    <button onClick={useCurrentLocation} style={{ padding: "6px 12px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>📍 Use My Current Location</button>
                  </div>
                  <div style={{ flex: 1, position: "relative", minHeight: "400px", borderRadius: "8px", overflow: "hidden", marginTop: "12px", zIndex: 0 }}>
                    <MapContainer center={[location.latitude, location.longitude]} zoom={10} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      <LocationMarker position={[location.latitude, location.longitude]} updateLocation={updateLocation} />
                      
                      {/* Render active alerts on the map */}
                      {alerts && alerts.map((alert, idx) => (
                        <AlertMarker key={`alert-${idx}`} alert={alert} updateLocation={updateLocation} />
                      ))}
                    </MapContainer>
                  </div>
                  <div style={{ padding: "10px 12px", background: "#f8fafc", marginTop: "8px", borderRadius: "6px", fontSize: "0.85rem" }}>
                    <strong>📍 {location.name}</strong> — {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                  </div>
                </div>

                {/* RAINFALL CHART */}
                <div className="dashboard-panel rainfall-panel" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="panel-header">
                    <h2>Rainfall Trend — 7 Days</h2>
                    {weather?.data_source && <span style={{ fontSize: "0.7rem", background: weather.data_source === "LIVE" ? "#dcfce7" : "#fef3c7", padding: "3px 8px", borderRadius: "4px" }}>{weather.data_source}</span>}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "16px", position: "relative" }}>
                    {displayHistory && displayHistory.length > 0 ? (
                      <div style={{ flex: 1, position: "relative", width: "100%" }}>
                        {/* Chart Area Container (leaves 24px at bottom for dates) */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: "24px" }}>
                          {/* SVG Background for Line and Area */}
                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                            <defs>
                              <linearGradient id="rfill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Grid Lines */}
                            <line x1="0" y1="95" x2="100" y2="95" stroke="#e2e8f0" strokeWidth="0.5" />
                            <line x1="0" y1="65" x2="100" y2="65" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
                            <line x1="0" y1="35" x2="100" y2="35" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />
                            <line x1="0" y1="5" x2="100" y2="5" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2 2" />

                            {/* Line and Area Paths */}
                            <path d={(() => {
                              const maxRain = Math.max(...displayHistory.map(h => h.rainfall || 0), 1);
                              return displayHistory.map((h, i) => {
                                const x = 5 + (i / (displayHistory.length - 1)) * 90;
                                const y = 95 - (((h.rainfall || 0) / maxRain) * 90);
                                return (i === 0 ? `M${x} ${y}` : `L${x} ${y}`);
                              }).join(" ") + ` L95 100 L5 100 Z`;
                            })()} fill="url(#rfill)" />
                            
                            <path d={(() => {
                              const maxRain = Math.max(...displayHistory.map(h => h.rainfall || 0), 1);
                              return displayHistory.map((h, i) => {
                                const x = 5 + (i / (displayHistory.length - 1)) * 90;
                                const y = 95 - (((h.rainfall || 0) / maxRain) * 90);
                                return (i === 0 ? `M${x} ${y}` : `L${x} ${y}`);
                              }).join(" ");
                            })()} fill="none" stroke="#2563eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                          </svg>

                          {/* HTML Overlays for Dots and Values */}
                          {displayHistory.map((h, i) => {
                            const maxRain = Math.max(...displayHistory.map(d => d.rainfall || 0), 1);
                            const x = 5 + (i / (displayHistory.length - 1)) * 90;
                            const y = 95 - (((h.rainfall || 0) / maxRain) * 90);

                            return (
                              <div key={`dot-${i}`} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", zIndex: 10 }}>
                                <div style={{ position: "relative" }}>
                                  <div style={{ width: "8px", height: "8px", background: "#fff", border: "2px solid #2563eb", borderRadius: "50%", boxShadow: "0 0 0 2px rgba(255,255,255,0.5)" }}></div>
                                  <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translate(-50%, -4px)", paddingBottom: "2px", fontSize: "11px", fontWeight: "600", color: "#334155", whiteSpace: "nowrap" }}>
                                    {formatValueOnly(h.rainfall, "rainfall", settings)}{getUnitSymbol("rainfall", settings)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Dates Overlay */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "24px" }}>
                          {displayHistory.map((h, i) => {
                            const x = 5 + (i / (displayHistory.length - 1)) * 90;
                            return (
                              <div key={`date-${i}`} style={{ position: "absolute", left: `${x}%`, bottom: "0", transform: "translateX(-50%)", fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
                                {h.date?.substring(5)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : <p style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No rainfall history available.</p>}
                  </div>
                </div>
              </section>

              {/* BOTTOM GRID */}
              <section className="dashboard-bottom-grid">
                {/* WEATHER */}
                <div className="dashboard-panel">
                  <div className="panel-header"><h2>Current Weather</h2></div>
                  <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Thermometer size={18} color="#dc2626" /><div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Temperature</div><strong>{convertUnits(weather?.temperature, "temperature", settings)}</strong></div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Droplets size={18} color="#2563eb" /><div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Humidity</div><strong>{fmt(weather?.humidity, 0)}%</strong></div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Wind size={18} color="#64748b" /><div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Wind Speed</div><strong>{convertUnits(weather?.wind_speed, "wind_speed", settings)}</strong></div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CloudRain size={18} color="#0ea5e9" /><div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Current Rain</div><strong>{convertUnits(weather?.rainfall_mm_hr, "rainfall", settings)}/hr</strong></div></div>
                  </div>
                </div>

                {/* ML INPUT TABLE */}
                <div className="dashboard-panel">
                  <div className="panel-header"><h2>ML Model Input (9 Features)</h2></div>
                  <div className="locations-table-container">
                    <table className="locations-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}><th style={{padding:"8px"}}>Feature</th><th style={{padding:"8px"}}>Value</th><th style={{padding:"8px"}}>Source</th></tr></thead>
                      <tbody>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rainfall_mm_hr</td><td>{fmt(weather?.rainfall_mm_hr)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>elevation_m</td><td>{terrainAvailable ? fmt(terrain?.elevation_m) : "UNAVAILABLE"}</td><td>{terrain?.source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>slope_degree</td><td>{terrainAvailable ? fmt(terrain?.slope_degree) : "UNAVAILABLE"}</td><td>{terrain?.source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rain_1h</td><td>{fmt(weather?.rain_1h)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rain_3h</td><td>{fmt(weather?.rain_3h)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rain_6h</td><td>{fmt(weather?.rain_6h)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rain_12h</td><td>{fmt(weather?.rain_12h)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr style={{borderBottom:"1px solid #f1f5f9"}}><td style={{padding:"6px 8px"}}>rain_24h</td><td>{fmt(weather?.rain_24h)}</td><td>{weather?.data_source || "—"}</td></tr>
                        <tr><td style={{padding:"6px 8px"}}>rainfall_change</td><td>{fmt(weather?.rainfall_change)}</td><td>{weather?.data_source || "—"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* ALERTS + PREDICTION HISTORY */}
              <section className="dashboard-bottom-grid" style={{ marginTop: "20px" }}>
                {/* RECENT ALERTS */}
                <div className="dashboard-panel">
                  <div className="panel-header"><h2>Recent Alerts</h2></div>
                  <div style={{ padding: "8px" }}>
                    {alerts && alerts.length > 0 ? alerts.slice(0, 5).map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", padding: "12px", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", marginBottom: "8px" }}>
                        <ShieldAlert size={20} color="#dc2626" />
                        <div>
                          <h5 style={{ margin: 0, color: "#dc2626", fontSize: "0.85rem" }}>{a.risk_level} FLOOD RISK</h5>
                          <p style={{ margin: "4px 0", fontSize: "0.8rem", color: "#374151" }}>{a.location_name} — {(a.probability * 100).toFixed(1)}%</p>
                          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{new Date(a.timestamp).toLocaleString()} • {a.data_source}</span>
                        </div>
                      </div>
                    )) : <p style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>No active flood alerts.</p>}
                  </div>
                </div>

                {/* PREDICTION HISTORY */}
                <div className="dashboard-panel">
                  <div className="panel-header"><h2>Prediction History (Database)</h2></div>
                  <div className="locations-table-container">
                    {predictionHistory && predictionHistory.length > 0 ? (
                      <table className="locations-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                        <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}><th style={{padding:"8px"}}>Time</th><th style={{padding:"8px"}}>Location</th><th style={{padding:"8px"}}>Prob</th><th style={{padding:"8px"}}>Risk</th></tr></thead>
                        <tbody>
                          {predictionHistory.slice(0, 10).map((h, i) => (
                            <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                              <td style={{padding:"6px 8px"}}>{new Date(h.timestamp).toLocaleString()}</td>
                              <td style={{padding:"6px 8px"}}>{h.location_name}</td>
                              <td style={{padding:"6px 8px"}}>{(h.flood_probability * 100).toFixed(1)}%</td>
                              <td style={{padding:"6px 8px"}}><span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, color: "#fff", background: h.risk_level === "CRITICAL" ? "#991b1b" : h.risk_level === "HIGH" ? "#dc2626" : h.risk_level === "MEDIUM" ? "#d97706" : "#16a34a" }}>{h.risk_level}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>No prediction history yet. Select a location with terrain coverage to generate predictions.</p>}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
