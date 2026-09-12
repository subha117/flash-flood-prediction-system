import React, { useMemo, useState, useEffect, useContext } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    AlertTriangle,
    MapPin,
    ArrowRight,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    CloudRain,
    Waves,
    Info,
    X,
    CheckCircle2,
} from "lucide-react";

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import { AuthContext } from "../../../context/AuthContext";
import { LocationContext } from "../../../context/LocationContext";
import "./Alerts.css";

/* =========================================================
   MAP RESIZE CONTROLLER
========================================================= */
function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
            if (center) {
                map.flyTo(center, zoom || 8, { duration: 0.6 });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [map, center, zoom]);
    return null;
}

/* =========================================================
   ALERTS SEED DATA (UTTARAKHAND CATCHMENT BASINS)
========================================================= */
const ALERTS_DATA = [
    {
        id: "ALT-2026-0007",
        location: "Tehri",
        district: "Tehri Garhwal",
        risk: "CRITICAL",
        type: "Flash Flood Warning",
        triggered: "30 Aug 2026, 10:20 AM",
        validUntil: "30 Aug 2026, 04:20 PM",
        probability: 92,
        rainfall24h: 156.4,
        status: "Active",
        description:
            "Heavy rainfall predicted in next 6 hours. Flash flood highly likely in low-lying areas and near river channels.",
        impact: "Immediate evacuation of low-lying settlements required",
        lat: 30.372,
        lng: 78.492,
    },
    {
        id: "ALT-2026-0006",
        location: "Rudraprayag",
        district: "Rudraprayag",
        risk: "HIGH",
        type: "River Level Warning",
        triggered: "30 Aug 2026, 09:45 AM",
        validUntil: "30 Aug 2026, 03:45 PM",
        probability: 85,
        rainfall24h: 128.5,
        status: "Active",
        description:
            "River level crossed warning threshold. Immediate precautions advised near river confluences.",
        impact: "High precaution advised along riverbeds",
        lat: 30.284,
        lng: 78.981,
    },
    {
        id: "ALT-2026-0005",
        location: "Chamoli",
        district: "Chamoli",
        risk: "HIGH",
        type: "Heavy Rainfall Alert",
        triggered: "30 Aug 2026, 09:10 AM",
        validUntil: "30 Aug 2026, 02:10 PM",
        probability: 78,
        rainfall24h: 112.0,
        status: "Active",
        description:
            "Very high rainfall intensity detected. Flash flood possible in vulnerable mountain valleys.",
        impact: "High caution in hilly drainages",
        lat: 30.404,
        lng: 79.322,
    },
    {
        id: "ALT-2026-0004",
        location: "Pauri Garhwal",
        district: "Pauri Garhwal",
        risk: "MODERATE",
        type: "Flash Flood Watch",
        triggered: "30 Aug 2026, 08:35 AM",
        validUntil: "30 Aug 2026, 01:35 PM",
        probability: 62,
        rainfall24h: 84.5,
        status: "Active",
        description:
            "Moderate flood risk due to persistent rainfall and saturated catchment soils.",
        impact: "Stay alert near stream banks",
        lat: 30.15,
        lng: 78.78,
    },
    {
        id: "ALT-2026-0003",
        location: "Uttarkashi",
        district: "Uttarkashi",
        risk: "MODERATE",
        type: "Heavy Rainfall Alert",
        triggered: "30 Aug 2026, 08:00 AM",
        validUntil: "30 Aug 2026, 01:00 PM",
        probability: 55,
        rainfall24h: 76.2,
        status: "Active",
        description:
            "Heavy rainfall expected over upper catchments. Localized stream swelling possible.",
        impact: "Monitor conditions",
        lat: 30.7268,
        lng: 78.4354,
    },
    {
        id: "ALT-2026-0002",
        location: "Haridwar",
        district: "Haridwar",
        risk: "LOW",
        type: "Weather Advisory",
        triggered: "30 Aug 2026, 07:30 AM",
        validUntil: "30 Aug 2026, 12:30 PM",
        probability: 28,
        rainfall24h: 32.0,
        status: "Active",
        description:
            "Light to moderate rainfall expected. No immediate flood threat detected.",
        impact: "Normal conditions",
        lat: 29.9457,
        lng: 78.1642,
    },
    {
        id: "ALT-2026-0001",
        location: "Nainital",
        district: "Nainital",
        risk: "LOW",
        type: "Weather Advisory",
        triggered: "30 Aug 2026, 07:15 AM",
        validUntil: "30 Aug 2026, 12:15 PM",
        probability: 22,
        rainfall24h: 24.5,
        status: "Active",
        description:
            "Weather conditions remain within normal seasonal ranges with low flood probability.",
        impact: "Normal conditions",
        lat: 29.3919,
        lng: 79.4542,
    },
    {
        id: "ALT-2026-0008",
        location: "Dehradun",
        district: "Dehradun",
        risk: "HIGH",
        type: "Heavy Rainfall Alert",
        triggered: "29 Aug 2026, 11:50 PM",
        validUntil: "30 Aug 2026, 05:50 AM",
        probability: 73,
        rainfall24h: 118.0,
        status: "Active",
        description:
            "Heavy rainfall may cause rapid runoff in Bindal and Rispana catchment corridors.",
        impact: "High caution in low areas",
        lat: 30.3165,
        lng: 78.0322,
    },
    {
        id: "ALT-2026-0009",
        location: "Almora",
        district: "Almora",
        risk: "MODERATE",
        type: "Flash Flood Watch",
        triggered: "29 Aug 2026, 10:40 PM",
        validUntil: "30 Aug 2026, 04:40 AM",
        probability: 58,
        rainfall24h: 68.0,
        status: "Active",
        description:
            "Moisture convergence may trigger short-duration intense rainfall cells.",
        impact: "Stay alert",
        lat: 29.5892,
        lng: 79.6467,
    },
];

const DISTRICTS = [
    "All Districts",
    "Tehri Garhwal",
    "Rudraprayag",
    "Chamoli",
    "Pauri Garhwal",
    "Uttarkashi",
    "Nainital",
    "Haridwar",
    "Dehradun",
    "Almora",
];

const RISK_LEVELS = ["All Risk Levels", "CRITICAL", "HIGH", "MODERATE", "LOW"];
const TYPES = [
    "All Types",
    "Flash Flood Warning",
    "River Level Warning",
    "Heavy Rainfall Alert",
    "Flash Flood Watch",
    "Weather Advisory",
];

function getMarkerColor(risk) {
    switch (risk) {
        case "CRITICAL":
            return { stroke: "#b91c1c", fill: "#ef4444" };
        case "HIGH":
            return { stroke: "#c2410c", fill: "#f97316" };
        case "MODERATE":
            return { stroke: "#a16207", fill: "#eab308" };
        case "LOW":
        default:
            return { stroke: "#15803d", fill: "#22c55e" };
    }
}

function Alerts({ onNavigate }) {
    const { user } = useContext(AuthContext);
    const { currentLocation, alerts: contextAlerts, activeAlertCount } = useContext(LocationContext);

    const [search, setSearch] = useState("");
    const [district, setDistrict] = useState("All Districts");
    const [risk, setRisk] = useState("All Risk Levels");
    const [type, setType] = useState("All Types");
    const [activeOnly, setActiveOnly] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [mapMode, setMapMode] = useState("All");
    const [mapCenter, setMapCenter] = useState([30.372, 78.492]);
    const [mapZoom, setMapZoom] = useState(8);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    // Auto email dispatch tracking
    const [autoEmailStatus, setAutoEmailStatus] = useState("idle");
    const [apiAlerts, setApiAlerts] = useState([]);

    // Effective recipient email
    const recipientEmail =
        user?.email || localStorage.getItem("user_email") || "user@example.com";

    // Fetch API alerts
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/alerts")
            .then((r) => r.json())
            .then((data) => {
                const formatted = data.map((a) => ({
                    id: `API-${a.id}`,
                    location: a.location_name || "Unknown",
                    district: a.location_name || "Unknown",
                    risk: a.risk_level,
                    type: a.data_source === "GOV_BROADCAST" ? "Gov Broadcast" : "Automated Alert",
                    triggered: new Date(a.timestamp).toLocaleString(),
                    validUntil: "N/A",
                    probability: Math.round(a.probability * 100),
                    rainfall24h: 130.0,
                    status: a.resolved ? "Resolved" : "Active",
                    description: a.reason || "Severe hydrological runoff reported.",
                    impact: a.risk_level === "CRITICAL" ? "Immediate action required" : "Stay alert",
                    lat: a.latitude || 30.372,
                    lng: a.longitude || 78.492,
                }));
                setApiAlerts(formatted);
            })
            .catch(() => {});
    }, []);

    const allAlerts = useMemo(() => [...apiAlerts, ...ALERTS_DATA], [apiAlerts]);

    // Check if the user's location has a Critical or High threat
    const activeThreatInUserArea = useMemo(() => {
        if (!allAlerts.length) return null;
        const userLoc = (currentLocation?.name || "Tehri").toLowerCase();
        const userDist = (currentLocation?.district || "").toLowerCase();

        return (
            allAlerts.find((alert) => {
                const isHighOrCritical =
                    alert.risk === "CRITICAL" || alert.risk === "HIGH";
                if (!isHighOrCritical) return false;

                const aLoc = alert.location.toLowerCase();
                const aDist = alert.district.toLowerCase();

                return (
                    aLoc.includes(userLoc) ||
                    userLoc.includes(aLoc) ||
                    (userDist && (aDist.includes(userDist) || userDist.includes(aDist)))
                );
            }) || allAlerts.find((a) => a.risk === "CRITICAL") || null
        );
    }, [allAlerts, currentLocation]);

    // AUTOMATICALLY DISPATCH EMAIL IN THE BACKGROUND TO USER'S EMAIL
    useEffect(() => {
        if (activeThreatInUserArea && recipientEmail) {
            const sessionKey = `sent_alert_${recipientEmail}_${activeThreatInUserArea.id}`;
            const alreadySent = sessionStorage.getItem(sessionKey);

            if (!alreadySent) {
                fetch("http://127.0.0.1:8000/api/alerts/notify-critical-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: recipientEmail,
                        user_name: user?.name || "Resident",
                        location_name: activeThreatInUserArea.location,
                        risk_level: activeThreatInUserArea.risk,
                        flood_probability: activeThreatInUserArea.probability / 100,
                        rainfall_24h: activeThreatInUserArea.rainfall24h || 120.0,
                        alert_id: activeThreatInUserArea.id,
                        reason: activeThreatInUserArea.description,
                        force: false,
                    }),
                })
                    .then((r) => r.json())
                    .then((data) => {
                        if (data && data.success) {
                            sessionStorage.setItem(sessionKey, "true");
                            setAutoEmailStatus("sent");
                        }
                    })
                    .catch(() => {});
            } else {
                setAutoEmailStatus("sent");
            }
        }
    }, [activeThreatInUserArea, recipientEmail, user]);

    // Table filtering logic
    const filteredAlerts = useMemo(() => {
        return allAlerts.filter((alert) => {
            const query = search.trim().toLowerCase();

            const matchesSearch =
                !query ||
                alert.id.toLowerCase().includes(query) ||
                alert.location.toLowerCase().includes(query) ||
                alert.district.toLowerCase().includes(query) ||
                alert.type.toLowerCase().includes(query);

            const matchesDistrict =
                district === "All Districts" ||
                alert.district.toLowerCase() === district.toLowerCase();

            const matchesRisk =
                risk === "All Risk Levels" || alert.risk === risk;

            const matchesType =
                type === "All Types" || alert.type === type;

            const matchesStatus = !activeOnly || alert.status === "Active";

            const matchesMap =
                mapMode === "All" ||
                alert.risk === mapMode ||
                (mapMode === "Critical" && alert.risk === "CRITICAL");

            return (
                matchesSearch &&
                matchesDistrict &&
                matchesRisk &&
                matchesType &&
                matchesStatus &&
                matchesMap
            );
        });
    }, [allAlerts, search, district, risk, type, activeOnly, mapMode]);

    const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / rowsPerPage));

    const visibleAlerts = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredAlerts.slice(start, start + rowsPerPage);
    }, [filteredAlerts, page, rowsPerPage]);

    const counts = {
        critical: allAlerts.filter((a) => a.risk === "CRITICAL").length,
        high: allAlerts.filter((a) => a.risk === "HIGH").length,
        moderate: allAlerts.filter((a) => a.risk === "MODERATE").length,
        low: allAlerts.filter((a) => a.risk === "LOW").length,
        total: allAlerts.length,
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setRisk(category === "ALL" ? "All Risk Levels" : category);
        setMapMode(category === "ALL" ? "All" : category);
        setPage(1);

        if (category === "ALL") {
            setMapCenter([30.372, 78.492]);
            setMapZoom(8);
        } else {
            const firstMatching = allAlerts.find((a) => a.risk === category);
            if (firstMatching && firstMatching.lat && firstMatching.lng) {
                setMapCenter([firstMatching.lat, firstMatching.lng]);
                setMapZoom(9);
            } else {
                setMapCenter([30.372, 78.492]);
                setMapZoom(8);
            }
        }
    };

    const handleAlertSelect = (alert) => {
        setSelectedAlert(alert);
        if (alert.lat && alert.lng) {
            setMapCenter([alert.lat, alert.lng]);
            setMapZoom(10);
        }
    };

    const categoryAlerts = useMemo(() => {
        if (selectedCategory === "ALL") {
            return [...allAlerts].sort((a, b) => b.probability - a.probability).slice(0, 4);
        }
        return allAlerts.filter((a) => a.risk === selectedCategory).slice(0, 4);
    }, [allAlerts, selectedCategory]);

    const categoryMeta = useMemo(() => {
        switch (selectedCategory) {
            case "CRITICAL":
                return {
                    title: "Recent Critical Alerts",
                    countText: `${counts.critical} Critical Alert${counts.critical === 1 ? "" : "s"} Active`,
                    type: "critical",
                };
            case "HIGH":
                return {
                    title: "Recent High Alerts",
                    countText: `${counts.high} High Alert${counts.high === 1 ? "" : "s"} Active`,
                    type: "high",
                };
            case "MODERATE":
                return {
                    title: "Recent Moderate Alerts",
                    countText: `${counts.moderate} Moderate Alert${counts.moderate === 1 ? "" : "s"} Active`,
                    type: "moderate",
                };
            case "LOW":
                return {
                    title: "Recent Low Alerts",
                    countText: `${counts.low} Low Alert${counts.low === 1 ? "" : "s"} Active`,
                    type: "low",
                };
            case "ALL":
            default:
                return {
                    title: "Recent Active Alerts",
                    countText: `${counts.total} Total Alerts Active`,
                    type: "all",
                };
        }
    }, [selectedCategory, counts]);

    const clearFilters = () => {
        setSearch("");
        setDistrict("All Districts");
        setRisk("All Risk Levels");
        setType("All Types");
        setActiveOnly(false);
        setMapMode("All");
        setSelectedCategory("ALL");
        setMapCenter([30.372, 78.492]);
        setMapZoom(8);
        setPage(1);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const mapMarkers = useMemo(() => {
        if (selectedCategory === "ALL") return allAlerts;
        return allAlerts.filter((alert) => alert.risk === selectedCategory);
    }, [allAlerts, selectedCategory]);

    const userDisplayName = user?.name || "Souvik Konar";
    const userDisplayRole = user?.role || "Admin";
    const userInitials =
        userDisplayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "SK";

    const effectiveAlertCount =
        activeAlertCount !== undefined
            ? activeAlertCount
            : contextAlerts && contextAlerts.length > 0
            ? contextAlerts.length
            : counts.critical || 1;

    return (
        <div className="alerts-page">
            <Sidebar activePage="alerts" onNavigate={onNavigate} alertCount={effectiveAlertCount} />

            <main className="alerts-main">
                {/* NORMAL TOP HEADER */}
                <Navbar 
        title="Alerts" 
        subtitle="Real-time flash flood alerts and notifications"
    />

                <section className="alerts-content">
                    {/* AUTOMATED EMAIL DISPATCH STATUS BANNER */}
                    {activeThreatInUserArea && (
                        <div className="location-warning-strip">
                            <AlertTriangle size={18} className="warning-strip-icon" />
                            <div className="warning-strip-text">
                                <strong>Severe Flood Warning for {activeThreatInUserArea.location}: </strong>
                                <span>
                                    {activeThreatInUserArea.description} (Risk: {activeThreatInUserArea.probability}%).
                                    {autoEmailStatus === "sent" ? (
                                        <span> An emergency notification email has been automatically dispatched to <strong>{recipientEmail}</strong>.</span>
                                    ) : (
                                        <span> Emergency alert notification linked to <strong>{recipientEmail}</strong>.</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* SECTION EYEBROW */}
                    <div className="section-eyebrow">ALERT OVERVIEW</div>

                    {/* NORMAL STAT CARDS GRID */}
                    <div className="alert-stat-grid">
                        <button
                            type="button"
                            className={`alert-stat-card critical ${selectedCategory === "CRITICAL" ? "selected" : ""}`}
                            onClick={() => handleCategoryChange("CRITICAL")}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <strong>{counts.critical}</strong>
                                <span>Critical Alerts</span>
                                <small>Immediate action required</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`alert-stat-card high ${selectedCategory === "HIGH" ? "selected" : ""}`}
                            onClick={() => handleCategoryChange("HIGH")}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <strong>{counts.high}</strong>
                                <span>High Alerts</span>
                                <small>Take necessary precautions</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`alert-stat-card moderate ${selectedCategory === "MODERATE" ? "selected" : ""}`}
                            onClick={() => handleCategoryChange("MODERATE")}
                        >
                            <div className="alert-stat-icon">
                                <CloudRain size={20} />
                            </div>
                            <div>
                                <strong>{counts.moderate}</strong>
                                <span>Moderate Alerts</span>
                                <small>Stay informed</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`alert-stat-card low ${selectedCategory === "LOW" ? "selected" : ""}`}
                            onClick={() => handleCategoryChange("LOW")}
                        >
                            <div className="alert-stat-icon">
                                <Info size={20} />
                            </div>
                            <div>
                                <strong>{counts.low}</strong>
                                <span>Low Alerts</span>
                                <small>Normal conditions</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`alert-stat-card total ${selectedCategory === "ALL" ? "selected" : ""}`}
                            onClick={() => handleCategoryChange("ALL")}
                        >
                            <div className="alert-stat-icon">
                                <Waves size={20} />
                            </div>
                            <div>
                                <strong>{counts.total}</strong>
                                <span>Total Alerts (24h)</span>
                                <small>All active alerts</small>
                            </div>
                        </button>
                    </div>

                    {/* TOP GRID: MAP & RECENT ALERTS (DYNAMICALLY INTERCONNECTED) */}
                    <div className="alerts-top-grid">
                        <section className="panel map-panel">
                            <div className="panel-heading">
                                <h2>Active Alert Map</h2>

                                {/* Clean header-embedded legend filters */}
                                <div className="map-legend-bar">
                                    <button
                                        type="button"
                                        className={selectedCategory === "ALL" ? "active" : ""}
                                        onClick={() => handleCategoryChange("ALL")}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        className={selectedCategory === "CRITICAL" ? "active" : ""}
                                        onClick={() => handleCategoryChange("CRITICAL")}
                                    >
                                        <span className="dot dot-critical"></span> Critical
                                    </button>
                                    <button
                                        type="button"
                                        className={selectedCategory === "HIGH" ? "active" : ""}
                                        onClick={() => handleCategoryChange("HIGH")}
                                    >
                                        <span className="dot dot-high"></span> High
                                    </button>
                                    <button
                                        type="button"
                                        className={selectedCategory === "MODERATE" ? "active" : ""}
                                        onClick={() => handleCategoryChange("MODERATE")}
                                    >
                                        <span className="dot dot-moderate"></span> Moderate
                                    </button>
                                    <button
                                        type="button"
                                        className={selectedCategory === "LOW" ? "active" : ""}
                                        onClick={() => handleCategoryChange("LOW")}
                                    >
                                        <span className="dot dot-low"></span> Low
                                    </button>
                                </div>
                            </div>

                            <div className="alert-map">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    scrollWheelZoom={true}
                                    className="alerts-leaflet-container"
                                >
                                    <MapController center={mapCenter} zoom={mapZoom} />

                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {mapMarkers.map((alert) => {
                                        const colors = getMarkerColor(alert.risk);
                                        return (
                                            <CircleMarker
                                                key={alert.id}
                                                center={[alert.lat || 30.372, alert.lng || 78.492]}
                                                radius={alert.risk === "CRITICAL" ? 11 : alert.risk === "HIGH" ? 9 : 7}
                                                pathOptions={{
                                                    color: colors.stroke,
                                                    fillColor: colors.fill,
                                                    fillOpacity: 0.85,
                                                    weight: 2,
                                                }}
                                                eventHandlers={{
                                                    click: () => handleAlertSelect(alert),
                                                }}
                                            >
                                                <Popup>
                                                    <div className="map-bubble">
                                                        <strong>{alert.location}</strong>
                                                        <div className="bubble-type">{alert.type}</div>
                                                        <div className="bubble-meta">
                                                            Risk Tier: <b>{alert.risk}</b> ({alert.probability}%)
                                                        </div>
                                                        <p className="bubble-desc">{alert.description}</p>
                                                        <button
                                                            type="button"
                                                            className="bubble-btn"
                                                            onClick={() => handleAlertSelect(alert)}
                                                        >
                                                            Inspect Details
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })}
                                </MapContainer>

                                <div className="map-location-note">
                                    <Info size={13} />
                                    Click any marker circle to inspect live river basin telemetry
                                </div>
                            </div>
                        </section>

                        {/* RECENT ALERTS PANEL (DYNAMICALLY UPDATED ON TOUCH) */}
                        <section className="panel critical-panel">
                            <div className="panel-heading">
                                <h2>{categoryMeta.title}</h2>
                                <button
                                    type="button"
                                    className="view-all-link"
                                    onClick={() => {
                                        const el = document.getElementById("all-alerts-table");
                                        if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>

                            <div className="critical-list">
                                {categoryAlerts.length > 0 ? (
                                    categoryAlerts.map((alert) => (
                                        <button
                                            key={alert.id}
                                            type="button"
                                            className={`critical-item ${alert.risk.toLowerCase()}`}
                                            onClick={() => handleAlertSelect(alert)}
                                            title="Click to view details and inspect on map"
                                        >
                                            <div className={`critical-icon ${alert.risk.toLowerCase()}`}>
                                                {alert.risk === "CRITICAL" && <AlertTriangle size={18} />}
                                                {alert.risk === "HIGH" && <AlertTriangle size={18} />}
                                                {alert.risk === "MODERATE" && <CloudRain size={18} />}
                                                {alert.risk === "LOW" && <Info size={18} />}
                                            </div>
                                            <div className="critical-copy">
                                                <strong>{alert.location}</strong>
                                                <p>{alert.description}</p>
                                            </div>
                                            <div className={`critical-time ${alert.risk.toLowerCase()}`}>
                                                <strong>{alert.probability}%</strong>
                                                <span>Risk</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="critical-empty-state">
                                        <p>No active {selectedCategory.toLowerCase()} alerts at this time.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className={`critical-footer ${categoryMeta.type}`}
                                onClick={() => {
                                    const el = document.getElementById("all-alerts-table");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                <span>{categoryMeta.countText}</span>
                                <ArrowRight size={15} />
                            </button>
                        </section>
                    </div>

                    {/* ALL ACTIVE ALERTS TABLE */}
                    <section id="all-alerts-table" className="panel all-alerts-panel">
                        <div className="all-alerts-toolbar">
                            <div>
                                <h2>All Active Alerts</h2>
                            </div>

                            <div className="table-filters">
                                <select
                                    value={district}
                                    onChange={(e) => {
                                        setDistrict(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {DISTRICTS.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>

                                <select
                                    value={risk}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        handleCategoryChange(val === "All Risk Levels" ? "ALL" : val);
                                    }}
                                >
                                    {RISK_LEVELS.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>

                                <select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {TYPES.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className={`filter-button ${filterOpen ? "active" : ""}`}
                                    onClick={() => setFilterOpen((v) => !v)}
                                >
                                    <SlidersHorizontal size={14} />
                                    Filter
                                </button>
                            </div>
                        </div>

                        {filterOpen && (
                            <div className="advanced-filter-bar">
                                <label className="check-filter">
                                    <input
                                        type="checkbox"
                                        checked={activeOnly}
                                        onChange={(e) => {
                                            setActiveOnly(e.target.checked);
                                            setPage(1);
                                        }}
                                    />
                                    Active alerts only
                                </label>

                                <button type="button" onClick={clearFilters}>
                                    Clear all filters
                                </button>

                                <button type="button" onClick={() => setFilterOpen(false)}>
                                    Done
                                </button>
                            </div>
                        )}

                        <div className="alerts-table-wrap">
                            <table className="alerts-table">
                                <thead>
                                    <tr>
                                        <th>Alert ID</th>
                                        <th>Location</th>
                                        <th>Risk Level</th>
                                        <th>Type</th>
                                        <th>Triggered</th>
                                        <th>Valid Until</th>
                                        <th>Probability</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visibleAlerts.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="empty-state">
                                                No alerts match the current filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleAlerts.map((alert) => (
                                            <tr key={alert.id}>
                                                <td className="alert-id-cell">{alert.id}</td>
                                                <td>
                                                    <div className="location-cell">
                                                        <MapPin size={13} />
                                                        <strong>{alert.location}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`risk-pill ${alert.risk.toLowerCase()}`}>
                                                        {alert.risk}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="type-cell">
                                                        {alert.type.includes("River") ? (
                                                            <Waves size={13} />
                                                        ) : (
                                                            <CloudRain size={13} />
                                                        )}
                                                        <span>{alert.type}</span>
                                                    </div>
                                                </td>
                                                <td>{alert.triggered}</td>
                                                <td>{alert.validUntil}</td>
                                                <td className="probability-cell">
                                                    {alert.probability}%
                                                </td>
                                                <td>
                                                    <span className="status-active">
                                                        <i></i>
                                                        {alert.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="view-details-button"
                                                        type="button"
                                                        onClick={() => handleAlertSelect(alert)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="pagination-row">
                            <span>
                                Showing {filteredAlerts.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                                {Math.min(page * rowsPerPage, filteredAlerts.length)} of {counts.total} alerts
                            </span>

                            <div className="pagination-buttons">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={14} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const pNum = i + 1;
                                    return (
                                        <button
                                            key={pNum}
                                            type="button"
                                            className={page === pNum ? "active" : ""}
                                            onClick={() => setPage(pNum)}
                                        >
                                            {pNum}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            <label className="rows-control">
                                Rows:
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value="7">7</option>
                                    <option value="10">10</option>
                                    <option value="15">15</option>
                                </select>
                            </label>
                        </div>
                    </section>
                </section>

                {/* NORMAL DETAILS MODAL */}
                {selectedAlert && (
                    <div className="alert-modal-overlay" onClick={() => setSelectedAlert(null)}>
                        <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="alert-modal-header">
                                <div>
                                    <span className={`modal-risk-tag ${selectedAlert.risk.toLowerCase()}`}>
                                        {selectedAlert.risk}
                                    </span>
                                    <h3>{selectedAlert.location} — {selectedAlert.type}</h3>
                                </div>
                                <button type="button" onClick={() => setSelectedAlert(null)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="modal-grid">
                                <div>
                                    <span>District</span>
                                    <strong>{selectedAlert.district}</strong>
                                </div>
                                <div>
                                    <span>Probability</span>
                                    <strong>{selectedAlert.probability}%</strong>
                                </div>
                                <div>
                                    <span>Triggered</span>
                                    <strong>{selectedAlert.triggered}</strong>
                                </div>
                                <div>
                                    <span>Valid Until</span>
                                    <strong>{selectedAlert.validUntil}</strong>
                                </div>
                            </div>

                            <div className="modal-description">
                                <h4>Description</h4>
                                <p>{selectedAlert.description}</p>
                            </div>

                            <div className="modal-impact">
                                <AlertTriangle size={16} />
                                <div>
                                    <strong>Recommended Action</strong>
                                    <span>{selectedAlert.impact}</span>
                                </div>
                            </div>

                            <div className="modal-footer-strip">
                                <button
                                    type="button"
                                    className="modal-close-action"
                                    onClick={() => setSelectedAlert(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Alerts;
