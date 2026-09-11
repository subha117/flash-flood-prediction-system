import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  MapPin,
  CloudRain,
  Waves,
  Mountain,
  Droplets,
  RefreshCw,
  CalendarDays,
  Layers,
  Plus,
  Minus,
  LocateFixed,
  ArrowRight,
  History,
  X,
  AlertTriangle,
  Activity,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";

import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./RiskMapPage.css";

/* =========================================================
   RISK DATA
   Later this data will come from Data Module / API
========================================================= */

const riskLocations = [
  {
    id: 1,
    district: "Selected District",
    latitude: 22.5726,
    longitude: 88.3639,
    riskScore: 82,
    riskLevel: "Critical",
    rainfall24h: 135.2,
    rainfall1h: 42.5,
    soilMoisture: 68,
    elevation: 1520,
    slope: 28.4,
    riverDistance: 0.8,
  },
  {
    id: 2,
    district: "Rudraprayag",
    latitude: 30.2850,
    longitude: 78.9810,
    riskScore: 74,
    riskLevel: "High",
    rainfall24h: 118.4,
    rainfall1h: 38.2,
    soilMoisture: 64,
    elevation: 895,
    slope: 31.2,
    riverDistance: 1.2,
  },
  {
    id: 3,
    district: "Chamoli",
    latitude: 30.4040,
    longitude: 79.3200,
    riskScore: 68,
    riskLevel: "High",
    rainfall24h: 108.6,
    rainfall1h: 35.7,
    soilMoisture: 61,
    elevation: 1850,
    slope: 34.6,
    riverDistance: 1.5,
  },
  {
    id: 4,
    district: "Uttarkashi",
    latitude: 30.7268,
    longitude: 78.4354,
    riskScore: 61,
    riskLevel: "High",
    rainfall24h: 96.5,
    rainfall1h: 31.4,
    soilMoisture: 58,
    elevation: 1350,
    slope: 29.8,
    riverDistance: 1.8,
  },
  {
    id: 5,
    district: "Pauri Garhwal",
    latitude: 30.15,
    longitude: 78.78,
    riskScore: 57,
    riskLevel: "Moderate",
    rainfall24h: 86.2,
    rainfall1h: 27.5,
    soilMoisture: 55,
    elevation: 1650,
    slope: 25.7,
    riverDistance: 2.4,
  },
  {
    id: 6,
    district: "Dehradun",
    latitude: 30.3165,
    longitude: 78.0322,
    riskScore: 48,
    riskLevel: "Moderate",
    rainfall24h: 82.4,
    rainfall1h: 24.6,
    soilMoisture: 52,
    elevation: 640,
    slope: 14.8,
    riverDistance: 3.2,
  },
  {
    id: 7,
    district: "Nainital",
    latitude: 29.3919,
    longitude: 79.4542,
    riskScore: 44,
    riskLevel: "Moderate",
    rainfall24h: 75.8,
    rainfall1h: 22.1,
    soilMoisture: 49,
    elevation: 1938,
    slope: 22.5,
    riverDistance: 2.8,
  },
  {
    id: 8,
    district: "Pithoragarh",
    latitude: 29.5829,
    longitude: 80.2182,
    riskScore: 36,
    riskLevel: "Moderate",
    rainfall24h: 68.3,
    rainfall1h: 19.8,
    soilMoisture: 46,
    elevation: 1650,
    slope: 26.4,
    riverDistance: 3.1,
  },
  {
    id: 9,
    district: "Haridwar",
    latitude: 29.9457,
    longitude: 78.1642,
    riskScore: 24,
    riskLevel: "Low",
    rainfall24h: 45.3,
    rainfall1h: 12.4,
    soilMoisture: 39,
    elevation: 314,
    slope: 8.5,
    riverDistance: 4.2,
  },
];

/* =========================================================
   MAP MARKER
========================================================= */

function createMarkerIcon(score) {
  let color = "#22c55e";

  if (score > 80) color = "#dc2626";
  else if (score > 60) color = "#f97316";
  else if (score > 30) color = "#facc15";

  return L.divIcon({
    className: "risk-marker-wrapper",
    html: `
      <div class="risk-marker" style="--marker-color:${color}">
        <div class="risk-marker-pin">
          <span></span>
        </div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

/* =========================================================
   RISK COLOR
========================================================= */

function getRiskColor(score) {
  if (score <= 30) return "#22c55e";
  if (score <= 60) return "#facc15";
  if (score <= 80) return "#f97316";
  if (score <= 100) return "#dc2626";

  return "#a855f7";
}

/* =========================================================
   COMPONENT
========================================================= */

import { fetchFeatures, runPrediction } from "../../../services/api";

function RiskMapPage({ onNavigate }) {
  const [locations, setLocations] = useState(riskLocations);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [loadingMapData, setLoadingMapData] = useState(false);

  const [riskFilter, setRiskFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [timeRange, setTimeRange] = useState("24 Hours");
  const [mapRefresh, setMapRefresh] = useState(false);
  const [showLayers, setShowLayers] = useState(true);

  /* =======================================================
     FETCH REAL DATA
  ======================================================= */
  const loadRealData = async () => {
    setLoadingMapData(true);
    try {
      const updatedLocations = await Promise.all(
        riskLocations.map(async (loc) => {
          try {
            const features = await fetchFeatures(loc.latitude, loc.longitude);
            if (features.error) return loc;

            const payload = {
              latitude: loc.latitude,
              longitude: loc.longitude,
              rainfall_mm_hr: features.rainfall_mm_hr ?? 0,
              elevation_m: features.elevation_m ?? 0,
              slope_degree: features.slope_degree ?? 0,
              rain_1h: features.rain_1h ?? 0,
              rain_3h: features.rain_3h ?? 0,
              rain_6h: features.rain_6h ?? 0,
              rain_12h: features.rain_24h ?? 0,
              rain_24h: features.rain_24h ?? 0,
              rainfall_change: features.rainfall_change ?? 0,
            };

            const prediction = await runPrediction(payload);

            return {
              ...loc,
              riskScore: Math.round(prediction.flood_probability * 100),
              riskLevel: prediction.risk_level === "MEDIUM" ? "Moderate" : prediction.risk_level === "HIGH" ? "High" : "Low",
              rainfall24h: features.rain_24h?.toFixed(2) ?? "—",
              rainfall1h: features.rain_1h?.toFixed(2) ?? "—",
              elevation: Math.round(features.elevation_m ?? 0),
              slope: features.slope_degree?.toFixed(1) ?? "—",
            };
          } catch (err) {
            console.error("Failed to fetch data for", loc.district, err);
            return loc;
          }
        })
      );
      setLocations(updatedLocations);
      setSelectedLocation(updatedLocations[0]);
    } catch (e) {
      console.error("Error loading map data:", e);
    } finally {
      setLoadingMapData(false);
    }
  };

  React.useEffect(() => {
    loadRealData();
  }, []);

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const riskMatch =
        riskFilter === "All" ||
        location.riskLevel.toLowerCase() === riskFilter.toLowerCase();

      const districtMatch =
        districtFilter === "All Districts" ||
        location.district === districtFilter;

      return riskMatch && districtMatch;
    });
  }, [riskFilter, districtFilter, locations]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    setMapRefresh(true);
    loadRealData().then(() => setMapRefresh(false));
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="risk-map-page">

      {/* SIDEBAR */}

      <Sidebar
        activePage="riskmap"
        onNavigate={navigate}
      />

      {/* MAIN */}

      <div className="risk-map-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <Navbar 
          title="Flood Risk Map" 
          subtitle="Explore flood risk across Selected Region" 
        />

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="risk-filter-bar">

          <select
            value="Selected Region"
            onChange={() => {}}
          >
            <option>Selected Region</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) =>
              setDistrictFilter(e.target.value)
            }
          >
            <option>All Districts</option>

            {riskLocations.map((location) => (
              <option
                key={location.id}
                value={location.district}
              >
                {location.district}
              </option>
            ))}

          </select>

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
          >
            <option value="All">Risk Level: All</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <div className="risk-filter-spacer" />

          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value)
            }
          >
            <option>24 Hours</option>
            <option>12 Hours</option>
            <option>6 Hours</option>
            <option>1 Hour</option>
          </select>

          <button
            className="risk-refresh-button"
            onClick={handleRefresh}
          >
            <RefreshCw
              size={17}
              className={
                mapRefresh ? "refresh-spin" : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            MAIN MAP AREA
        ================================================= */}

        <div className="risk-workspace">

          {/* MAP */}

          <section className="interactive-map-card">

            <MapContainer
              center={[30.0668, 79.0193]}
              zoom={7}
              minZoom={6}
              maxZoom={12}
              className="interactive-map"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* RISK HEAT CIRCLES */}

              {showLayers &&
                filteredLocations.map((location) => (
                  <Circle
                    key={`circle-${location.id}`}
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={
                      location.riskScore > 80
                        ? 30000
                        : 22000
                    }
                    pathOptions={{
                      color: getRiskColor(
                        location.riskScore
                      ),
                      fillColor: getRiskColor(
                        location.riskScore
                      ),
                      fillOpacity:
                        location.riskScore > 80
                          ? 0.42
                          : 0.28,
                      weight: 1,
                    }}
                  />
                ))}

              {/* MARKERS */}

              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={[
                    location.latitude,
                    location.longitude,
                  ]}
                  icon={createMarkerIcon(
                    location.riskScore
                  )}
                  eventHandlers={{
                    click: () =>
                      setSelectedLocation(location),
                  }}
                >

                  <Popup>

                    <div className="map-popup">

                      <h3>
                        {location.district}
                      </h3>

                      <div
                        className="popup-risk"
                        style={{
                          color: getRiskColor(
                            location.riskScore
                          ),
                        }}
                      >
                        {location.riskScore}% Risk
                      </div>

                      <p>
                        Risk Level:{" "}
                        <strong>
                          {location.riskLevel}
                        </strong>
                      </p>

                      <p>
                        Rainfall:{" "}
                        {location.rainfall24h} mm
                      </p>

                      <button
                        onClick={() =>
                          setSelectedLocation(location)
                        }
                      >
                        View Details
                      </button>

                    </div>

                  </Popup>

                </Marker>
              ))}

            </MapContainer>

            {/* MAP CONTROLS */}

            <div className="custom-map-controls">

              <button>
                <Plus size={20} />
              </button>

              <button>
                <Minus size={20} />
              </button>

              <button>
                <LocateFixed size={19} />
              </button>

              <button
                onClick={() =>
                  setShowLayers(!showLayers)
                }
                className={
                  showLayers ? "active-control" : ""
                }
              >
                <Layers size={19} />
              </button>

            </div>

            {/* LEGEND */}

            <div className="map-risk-legend">

              <h3>Risk Level</h3>

              <div>
                <i className="legend-dot low" />
                <span>Low (0 - 30%)</span>
              </div>

              <div>
                <i className="legend-dot moderate" />
                <span>Moderate (30 - 60%)</span>
              </div>

              <div>
                <i className="legend-dot high" />
                <span>High (60 - 80%)</span>
              </div>

              <div>
                <i className="legend-dot critical" />
                <span>Critical (80 - 100%)</span>
              </div>

              <div>
                <i className="legend-dot extreme" />
                <span>Extreme (100%+)</span>
              </div>

            </div>

            {/* SCALE */}

            <div className="map-scale">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75 km</span>
            </div>

          </section>

          {/* =================================================
              RIGHT PANEL
          ================================================= */}

          <aside className="risk-details-panel">

            {/* SELECTED LOCATION */}

            <div className="details-card selected-location-card">

              <div className="details-card-header">

                <h2>Selected Location</h2>

                <button>
                  <X size={20} />
                </button>

              </div>

              <div className="selected-location-content">

                <MapPin
                  size={28}
                  className="selected-pin"
                />

                <div>

                  <h3>
                    {selectedLocation.district},
                    Selected Region
                  </h3>

                  <p>
                    {selectedLocation.latitude.toFixed(4)}
                    ° N,{" "}
                    {selectedLocation.longitude.toFixed(4)}
                    ° E
                  </p>

                  <span>
                    {selectedLocation.district} District
                  </span>

                </div>

              </div>

            </div>

            {/* FLOOD RISK */}

            <div className="details-card flood-risk-card">

              <div className="flood-risk-title">

                <h2>Flood Risk</h2>

                <span
                  className={`risk-level-badge ${
                    selectedLocation.riskLevel.toLowerCase()
                  }`}
                >
                  {selectedLocation.riskLevel.toUpperCase()}
                </span>

              </div>

              <div className="flood-score">

                <strong>
                  {selectedLocation.riskScore}%
                </strong>

                <span>Probability</span>

              </div>

              <div className="risk-gauge">

                <div
                  className="risk-gauge-fill"
                  style={{
                    "--risk-score":
                      `${selectedLocation.riskScore}%`,
                  }}
                />

              </div>

              <div className="risk-card-footer">

                Last Updated: 30 Aug 2026, 10:30 AM

              </div>

            </div>

            {/* ENVIRONMENT */}

            <div className="details-card environment-details-card">

              <h2>Environmental Conditions</h2>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <CloudRain size={20} />

                  <span>Rainfall (24H)</span>

                </div>

                <strong>
                  {selectedLocation.rainfall24h} mm
                </strong>

              </div>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <CloudRain size={20} />

                  <span>Rainfall (1H)</span>

                </div>

                <strong>
                  {selectedLocation.rainfall1h} mm
                </strong>

              </div>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <Droplets size={20} />

                  <span>Soil Moisture</span>

                </div>

                <strong>
                  {selectedLocation.soilMoisture}%
                </strong>

              </div>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <Mountain size={20} />

                  <span>Elevation</span>

                </div>

                <strong>
                  {selectedLocation.elevation.toLocaleString()} m
                </strong>

              </div>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <Mountain size={20} />

                  <span>Slope</span>

                </div>

                <strong>
                  {selectedLocation.slope}°
                </strong>

              </div>

              <div className="environment-detail-row">

                <div className="environment-detail-name">

                  <Waves size={20} />

                  <span>Distance to River</span>

                </div>

                <strong>
                  {selectedLocation.riverDistance} km
                </strong>

              </div>

              <button
                className="view-prediction-button"
                onClick={() =>
                  navigate("prediction")
                }
              >
                <Activity size={18} />

                View Prediction

                <ArrowRight size={19} />

              </button>

              <button
                className="historical-button"
                onClick={() =>
                  navigate("historical")
                }
              >
                <History size={18} />

                View Historical Data

              </button>

            </div>

          </aside>

        </div>

        {/* =================================================
            BOTTOM SUMMARY CARDS
        ================================================= */}

        <div className="risk-summary-grid">

          <div className="risk-summary-card">

            <CloudRain size={38} />

            <div>

              <span>Avg. Rainfall (24H)</span>

              <strong>98.6 mm</strong>

              <small>State Average</small>

            </div>

          </div>

          <div className="risk-summary-card">

            <Activity size={38} />

            <div>

              <span>Max Risk Area</span>

              <strong className="danger-text">
                Selected Location Garhwal
              </strong>

              <small>
                82% (High)
              </small>

            </div>

          </div>

          <div className="risk-summary-card">

            <MapPin size={38} />

            <div>

              <span>Total Locations</span>

              <strong>1,248</strong>

              <small>Monitored</small>

            </div>

          </div>

          <div className="risk-summary-card">

            <AlertTriangle size={38} />

            <div>

              <span>High Risk Areas</span>

              <strong>12</strong>

              <small>Across Selected Region</small>

            </div>

          </div>

          <div className="risk-summary-card">

            <Waves size={38} />

            <div>

              <span>Rivers Monitored</span>

              <strong>65</strong>

              <small>Major Rivers</small>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default RiskMapPage;