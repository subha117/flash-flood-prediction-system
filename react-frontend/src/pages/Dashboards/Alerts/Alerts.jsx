import React, { useMemo, useState, useEffect } from "react";
import {
    Search,
    Bell,
    User,
    ChevronDown,
    AlertTriangle,
    MapPin,
    ArrowRight,
    SlidersHorizontal,
    Eye,
    ChevronLeft,
    ChevronRight,
    CloudRain,
    Waves,
    Info,
    Layers,
    Plus,
    Minus,
    X,
} from "lucide-react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import Sidebar from "../../../components/Sidebar/Sidebar";
import "./Alerts.css";

const ALERTS_DATA = [
    {
        id: "ALT-2026-0007",
        location: "Selected District",
        district: "Selected District",
        risk: "CRITICAL",
        type: "Flash Flood Warning",
        triggered: "30 Aug 2026, 10:20 AM",
        validUntil: "30 Aug 2026, 04:20 PM",
        probability: 92,
        status: "Active",
        description:
            "Heavy rainfall predicted in next 6 hours. Flash flood highly likely in low-lying areas and near river channels.",
        impact: "Immediate action required",
        lat: 56,
        top: 53,
        color: "red",
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
        status: "Active",
        description:
            "River level crossed warning threshold. Immediate precautions advised in nearby areas.",
        impact: "Precaution required",
        lat: 67,
        top: 45,
        color: "red",
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
        status: "Active",
        description:
            "Very high rainfall intensity detected. Flash flood possible in vulnerable regions.",
        impact: "High caution",
        lat: 79,
        top: 46,
        color: "red",
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
        status: "Active",
        description:
            "Moderate flood risk due to persistent rainfall and saturated catchments.",
        impact: "Stay alert",
        lat: 59,
        top: 70,
        color: "yellow",
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
        status: "Active",
        description:
            "Heavy rainfall expected over upper catchments. Localized flash flooding possible.",
        impact: "Monitor conditions",
        lat: 63,
        top: 26,
        color: "yellow",
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
        status: "Active",
        description:
            "Light to moderate rainfall expected. No immediate flood threat detected.",
        impact: "Normal conditions",
        lat: 37,
        top: 72,
        color: "green",
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
        status: "Active",
        description:
            "Weather conditions remain within normal range with low flood probability.",
        impact: "Normal conditions",
        lat: 76,
        top: 68,
        color: "green",
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
        status: "Active",
        description: "Heavy rainfall may cause rapid runoff in urban and hilly catchments.",
        impact: "High caution",
        lat: 31,
        top: 43,
        color: "orange",
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
        status: "Active",
        description: "Moisture convergence may trigger short-duration intense rainfall.",
        impact: "Stay alert",
        lat: 82,
        top: 76,
        color: "orange",
    },
    {
        id: "ALT-2026-0010",
        location: "Selected District",
        district: "Selected District",
        risk: "CRITICAL",
        type: "River Level Warning",
        triggered: "29 Aug 2026, 09:25 PM",
        validUntil: "30 Aug 2026, 03:25 AM",
        probability: 90,
        status: "Active",
        description: "River levels are rising rapidly after upstream rainfall.",
        impact: "Immediate action required",
        lat: 54,
        top: 60,
        color: "red",
    },
    {
        id: "ALT-2026-0011",
        location: "Chamoli",
        district: "Chamoli",
        risk: "HIGH",
        type: "Flash Flood Warning",
        triggered: "29 Aug 2026, 08:15 PM",
        validUntil: "30 Aug 2026, 02:15 AM",
        probability: 81,
        status: "Active",
        description: "High-risk rainfall cells detected around vulnerable valleys.",
        impact: "High caution",
        lat: 76,
        top: 39,
        color: "orange",
    },
    {
        id: "ALT-2026-0012",
        location: "Rudraprayag",
        district: "Rudraprayag",
        risk: "MODERATE",
        type: "Weather Advisory",
        triggered: "29 Aug 2026, 07:30 PM",
        validUntil: "30 Aug 2026, 01:30 AM",
        probability: 52,
        status: "Active",
        description: "Rainfall remains moderate but soils are becoming saturated.",
        impact: "Monitor conditions",
        lat: 70,
        top: 52,
        color: "yellow",
    },
    {
        id: "ALT-2026-0013",
        location: "Pauri Garhwal",
        district: "Pauri Garhwal",
        risk: "LOW",
        type: "Weather Advisory",
        triggered: "29 Aug 2026, 06:45 PM",
        validUntil: "30 Aug 2026, 12:45 AM",
        probability: 26,
        status: "Active",
        description: "Low flood probability with scattered showers.",
        impact: "Normal conditions",
        lat: 54,
        top: 66,
        color: "green",
    },
    {
        id: "ALT-2026-0014",
        location: "Uttarkashi",
        district: "Uttarkashi",
        risk: "HIGH",
        type: "Flash Flood Watch",
        triggered: "29 Aug 2026, 05:40 PM",
        validUntil: "29 Aug 2026, 11:40 PM",
        probability: 77,
        status: "Active",
        description: "Short-duration rainfall cells may produce rapid runoff.",
        impact: "High caution",
        lat: 60,
        top: 35,
        color: "orange",
    },
    {
        id: "ALT-2026-0015",
        location: "Haridwar",
        district: "Haridwar",
        risk: "LOW",
        type: "River Level Warning",
        triggered: "29 Aug 2026, 04:20 PM",
        validUntil: "29 Aug 2026, 10:20 PM",
        probability: 18,
        status: "Active",
        description: "River levels remain below warning stage.",
        impact: "Normal conditions",
        lat: 41,
        top: 68,
        color: "green",
    },
];

const DISTRICTS = [
    "All Districts",
    "Selected District",
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

function getRiskIcon(risk, size = 17) {
    if (risk === "LOW") return <Info size={size} />;
    if (risk === "MODERATE") return <AlertTriangle size={size} />;
    return <AlertTriangle size={size} />;
}

function riskClass(risk) {
    return risk.toLowerCase().replace(/\s+/g, "-");
}

function FixMapSize() {
    const map = useMap();

    useEffect(() => {
        const refresh = () => {
            map.invalidateSize(true);

            const tiles = map.getContainer().querySelectorAll("img.leaflet-tile");
            tiles.forEach((tile) => {
                tile.style.setProperty("opacity", "1", "important");
                tile.style.setProperty("visibility", "visible", "important");
                tile.style.setProperty("filter", "contrast(1.35) saturate(1.25) brightness(0.97)", "important");
                tile.style.setProperty("mix-blend-mode", "normal", "important");
            });
        };

        const timers = [100, 400, 900, 1500].map((delay) =>
            setTimeout(refresh, delay)
        );

        const observer = new MutationObserver(refresh);
        observer.observe(map.getContainer(), {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["style", "class"],
        });

        window.addEventListener("resize", refresh);

        return () => {
            timers.forEach(clearTimeout);
            observer.disconnect();
            window.removeEventListener("resize", refresh);
        };
    }, [map]);

    return null;
}

function Alerts({ onNavigate }) {
    const [search, setSearch] = useState("");
    const [district, setDistrict] = useState("All Districts");
    const [risk, setRisk] = useState("All Risk Levels");
    const [type, setType] = useState("All Types");
    const [activeOnly, setActiveOnly] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [mapMode, setMapMode] = useState("All");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [mapZoom, setMapZoom] = useState(1);

    const [apiAlerts, setApiAlerts] = useState([]);
    
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/alerts')
            .then(r => r.json())
            .then(data => {
                const formatted = data.map(a => ({
                    id: `API-${a.id}`,
                    location: a.location_name || "Unknown",
                    district: a.location_name || "Unknown",
                    risk: a.risk_level,
                    type: a.data_source === "GOV_BROADCAST" ? "Gov Broadcast" : "Automated Alert",
                    triggered: new Date(a.timestamp).toLocaleString(),
                    validUntil: "N/A",
                    probability: Math.round(a.probability * 100),
                    status: a.resolved ? "Resolved" : "Active",
                    description: a.reason,
                    impact: a.risk_level === "CRITICAL" ? "Immediate action required" : "Stay alert",
                    lat: a.latitude || 30.372,
                    top: 50,
                    color: a.risk_level === "CRITICAL" ? "red" : "orange",
                }));
                setApiAlerts(formatted);
            })
            .catch(console.error);
    }, []);

    const allAlerts = useMemo(() => [...apiAlerts, ...ALERTS_DATA], [apiAlerts]);

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
                district === "All Districts" || alert.district === district;

            const matchesRisk = risk === "All Risk Levels" || alert.risk === risk;

            const matchesType = type === "All Types" || alert.type === type;

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

    const recentCritical = allAlerts.filter(
        (alert) => alert.risk === "CRITICAL"
    ).slice(0, 3);

    const counts = {
        critical: allAlerts.filter(a => a.risk === "CRITICAL").length,
        high: allAlerts.filter(a => a.risk === "HIGH").length,
        moderate: allAlerts.filter(a => a.risk === "MODERATE").length,
        low: allAlerts.filter(a => a.risk === "LOW").length,
        total: allAlerts.length,
    };

    const clearFilters = () => {
        setSearch("");
        setDistrict("All Districts");
        setRisk("All Risk Levels");
        setType("All Types");
        setActiveOnly(false);
        setMapMode("All");
        setPage(1);
    };

    const handleRowsPerPage = (value) => {
        const next = Number(value);
        setRowsPerPage(next);
        setPage(1);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/";
    };

    const mapMarkers = allAlerts.filter((alert) => {
        if (mapMode === "All") return true;
        if (mapMode === "Critical") return alert.risk === "CRITICAL";
        return alert.risk === mapMode;
    });

    return (
        <div className="alerts-page">
            <Sidebar activePage="alerts" onNavigate={onNavigate} />

            <main className="alerts-main">
                <header className="alerts-header">
                    <div className="alerts-title">
                        <h1>Alerts</h1>
                        <p>Real-time flash flood alerts and notifications</p>
                    </div>

                    <div className="alerts-header-actions">
                        <div className="alerts-search">
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search location..."
                                type="text"
                            />
                            <Search size={18} />
                        </div>

                        <div className="alert-header-icon-wrap">
                            <button
                                className="alert-header-icon"
                                type="button"
                                onClick={() => {
                                    setNotificationsOpen((v) => !v);
                                    setProfileOpen(false);
                                }}
                            >
                                <Bell size={21} />
                                {apiAlerts.length > 0 && <span>{apiAlerts.length}</span>}
                            </button>

                            {notificationsOpen && (
                                <div className="mini-dropdown notification-dropdown">
                                    <strong>Notifications</strong>
                                    <p>3 critical alerts require attention.</p>
                                    <p>8 high-risk alerts are active.</p>
                                    <button type="button" onClick={() => setNotificationsOpen(false)}>
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="alert-profile-wrap">
                            <button
                                className="alert-profile"
                                type="button"
                                onClick={() => {
                                    setProfileOpen((v) => !v);
                                    setNotificationsOpen(false);
                                }}
                            >
                                <div className="alert-avatar">SK</div>
                                <div className="alert-profile-text">
                                    <strong>Souvik Konar</strong>
                                    <span>Admin</span>
                                </div>
                                <ChevronDown size={14} />
                            </button>

                            {profileOpen && (
                                <div className="mini-dropdown profile-dropdown">
                                    <button type="button">My Profile</button>
                                    <button type="button">Settings</button>
                                    <button type="button" className="logout-btn" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <section className="alerts-content">
                    <div className="section-eyebrow">ALERT OVERVIEW</div>

                    <div className="alert-stat-grid">
                        <button
                            type="button"
                            className="alert-stat-card critical"
                            onClick={() => {
                                setRisk("CRITICAL");
                                setPage(1);
                            }}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <strong>{counts.critical}</strong>
                                <span>Critical Alerts</span>
                                <small>Immediate action required</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="alert-stat-card high"
                            onClick={() => {
                                setRisk("HIGH");
                                setPage(1);
                            }}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <strong>{counts.high}</strong>
                                <span>High Alerts</span>
                                <small>Take necessary precautions</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="alert-stat-card moderate"
                            onClick={() => {
                                setRisk("MODERATE");
                                setPage(1);
                            }}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <strong>{counts.moderate}</strong>
                                <span>Moderate Alerts</span>
                                <small>Stay informed</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="alert-stat-card low"
                            onClick={() => {
                                setRisk("LOW");
                                setPage(1);
                            }}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <strong>{counts.low}</strong>
                                <span>Low Alerts</span>
                                <small>Normal conditions</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="alert-stat-card total"
                            onClick={clearFilters}
                        >
                            <div className="alert-stat-icon">
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <strong>{counts.total}</strong>
                                <span>Total Alerts (24h)</span>
                                <small>All active alerts</small>
                            </div>
                        </button>
                    </div>

                    <div className="alerts-top-grid">
                        <section className="panel map-panel">
                            <div className="panel-heading">
                                <h2>Active Alert Map</h2>
                            </div>

                            <div className="alert-map alert-leaflet-map">

                                <MapContainer
                                    center={[30.372, 78.492]}
                                    zoom={9}
                                    scrollWheelZoom={true}
                                    className="alerts-leaflet-container"
                                >
                                    <FixMapSize />

                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        className="alerts-map-tiles"
                                        opacity={1}
                                        zIndex={1}
                                        tileSize={256}
                                        zoomOffset={0}
                                        updateWhenIdle={false}
                                        keepBuffer={4}
                                    />

                                    {mapMarkers.map((alert) => {
                                        const positions = {
                                            "Selected District": [30.372, 78.492],
                                            Rudraprayag: [30.284, 78.981],
                                            Chamoli: [30.404, 79.322],
                                            "Pauri Garhwal": [30.15, 78.78],
                                            Uttarkashi: [30.7268, 78.4354],
                                            Haridwar: [29.9457, 78.1642],
                                            Nainital: [29.3919, 79.4542],
                                            Dehradun: [30.3165, 78.0322],
                                            Almora: [29.5892, 79.6467],
                                        };

                                        return (
                                            <Marker
                                                key={alert.id}
                                                position={
                                                    positions[alert.location] || [30.372, 78.492]
                                                }
                                            >
                                                <Popup>
                                                    <strong>{alert.location}</strong>
                                                    <br />
                                                    Risk: {alert.risk}
                                                    <br />
                                                    Probability: {alert.probability}%
                                                    <br />
                                                    {alert.type}
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                                </MapContainer>

                                {/* Risk Legend */}
                                <div className="map-legend">
                                    <button
                                        className={mapMode === "CRITICAL" ? "active" : ""}
                                        onClick={() => setMapMode("CRITICAL")}
                                        type="button"
                                    >
                                        <i className="legend-dot critical-dot"></i>
                                        Critical
                                    </button>

                                    <button
                                        className={mapMode === "HIGH" ? "active" : ""}
                                        onClick={() => setMapMode("HIGH")}
                                        type="button"
                                    >
                                        <i className="legend-dot high-dot"></i>
                                        High
                                    </button>

                                    <button
                                        className={mapMode === "MODERATE" ? "active" : ""}
                                        onClick={() => setMapMode("MODERATE")}
                                        type="button"
                                    >
                                        <i className="legend-dot moderate-dot"></i>
                                        Moderate
                                    </button>

                                    <button
                                        className={mapMode === "LOW" ? "active" : ""}
                                        onClick={() => setMapMode("LOW")}
                                        type="button"
                                    >
                                        <i className="legend-dot low-dot"></i>
                                        Low
                                    </button>

                                    <button
                                        className={mapMode === "All" ? "active" : ""}
                                        onClick={() => setMapMode("All")}
                                        type="button"
                                    >
                                        All
                                    </button>
                                </div>

                                <div className="map-location-note">
                                    <Info size={13} />
                                    Click on a marker to view alert details
                                </div>

                            </div>
                        </section>

                        <section className="panel critical-panel">
                            <div className="panel-heading">
                                <h2>Recent Critical Alerts</h2>
                                <button
                                    type="button"
                                    className="view-all-link"
                                    onClick={() => {
                                        setRisk("CRITICAL");
                                        setPage(1);
                                    }}
                                >
                                    View All <ArrowRight size={15} />
                                </button>
                            </div>

                            <div className="critical-list">
                                {recentCritical.map((alert) => (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        className="critical-item"
                                        onClick={() => setSelectedAlert(alert)}
                                    >
                                        <div className="critical-icon">
                                            <AlertTriangle size={17} />
                                        </div>
                                        <div className="critical-copy">
                                            <strong>{alert.location}</strong>
                                            <p>{alert.description}</p>
                                        </div>
                                        <div className="critical-time">
                                            <strong>{alert.triggered.split(", ")[1]}</strong>
                                            <span>30 Aug 2026</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="critical-footer"
                                onClick={() => {
                                    setRisk("CRITICAL");
                                    setPage(1);
                                }}
                            >
                                <span>3 Critical Alerts Active</span>
                                <ArrowRight size={17} />
                            </button>
                        </section>
                    </div>

                    <section className="panel all-alerts-panel">
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
                                        setRisk(e.target.value);
                                        setPage(1);
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
                                    <SlidersHorizontal size={15} />
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
                                        <th>District</th>
                                        <th>Risk Level</th>
                                        <th>Alert Type</th>
                                        <th>Triggered At</th>
                                        <th>Valid Until</th>
                                        <th>Probability</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visibleAlerts.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="empty-state">
                                                No alerts match the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleAlerts.map((alert) => (
                                            <tr key={alert.id}>
                                                <td>{alert.id}</td>
                                                <td>
                                                    <div className="location-cell">
                                                        <MapPin size={12} />
                                                        {alert.location}
                                                    </div>
                                                </td>
                                                <td>{alert.district}</td>
                                                <td>
                                                    <span className={`risk-pill ${riskClass(alert.risk)}`}>
                                                        {getRiskIcon(alert.risk, 11)}
                                                        {alert.risk}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="type-cell">
                                                        {alert.type.includes("River") ? (
                                                            <Waves size={15} />
                                                        ) : alert.type.includes("Rainfall") ? (
                                                            <CloudRain size={15} />
                                                        ) : (
                                                            <Info size={15} />
                                                        )}
                                                        {alert.type}
                                                    </div>
                                                </td>
                                                <td>{alert.triggered}</td>
                                                <td>{alert.validUntil}</td>
                                                <td className="probability-cell">{alert.probability}%</td>
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
                                                        onClick={() => setSelectedAlert(alert)}
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

                        <div className="pagination-row">
                            <span className="pagination-summary">
                                Showing{" "}
                                {filteredAlerts.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                                {Math.min(page * rowsPerPage, filteredAlerts.length)} of {counts.total} alerts
                            </span>

                            <div className="pagination-buttons">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                {[1, 2, 3].map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        className={page === pageNumber ? "active" : ""}
                                        onClick={() => setPage(Math.min(pageNumber, totalPages))}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <span className="pagination-dots">...</span>

                                <button
                                    type="button"
                                    className={page === totalPages ? "active" : ""}
                                    onClick={() => setPage(totalPages)}
                                >
                                    {Math.min(8, totalPages)}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                            <label className="rows-control">
                                Rows per page:
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => handleRowsPerPage(e.target.value)}
                                >
                                    <option value="7">7</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                </select>
                            </label>
                        </div>
                    </section>
                </section>

                {selectedAlert && (
                    <div className="alert-modal-overlay" onClick={() => setSelectedAlert(null)}>
                        <div
                            className="alert-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="alert-modal-header">
                                <div>
                                    <span className={`modal-risk-tag ${riskClass(selectedAlert.risk)}`}>
                                        {selectedAlert.risk}
                                    </span>
                                    <h3>{selectedAlert.location}</h3>
                                </div>

                                <button type="button" onClick={() => setSelectedAlert(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="modal-grid">
                                <div>
                                    <span>Alert ID</span>
                                    <strong>{selectedAlert.id}</strong>
                                </div>
                                <div>
                                    <span>Alert Type</span>
                                    <strong>{selectedAlert.type}</strong>
                                </div>
                                <div>
                                    <span>Probability</span>
                                    <strong>{selectedAlert.probability}%</strong>
                                </div>
                                <div>
                                    <span>Status</span>
                                    <strong>{selectedAlert.status}</strong>
                                </div>
                                <div>
                                    <span>Triggered At</span>
                                    <strong>{selectedAlert.triggered}</strong>
                                </div>
                                <div>
                                    <span>Valid Until</span>
                                    <strong>{selectedAlert.validUntil}</strong>
                                </div>
                            </div>

                            <div className="modal-description">
                                <h4>Alert Details</h4>
                                <p>{selectedAlert.description}</p>
                            </div>

                            <div className="modal-impact">
                                <AlertTriangle size={16} />
                                <div>
                                    <strong>{selectedAlert.impact}</strong>
                                    <span>Follow the latest official local authority guidance.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Alerts;
