import React, { useContext, useMemo, useState } from "react";
import { LocationContext } from "../../../context/LocationContext";
import { AuthContext } from "../../../context/AuthContext";

import {
    Bell,
    RefreshCw,
    ChevronDown,
    CloudRain,
    Cloud,
    RadioTower,
    Satellite,
    Database,
    ShieldCheck,
    Layers,
    Info,
    ArrowRight,
    Check,
    Map,
    MapPin,
    Navigation,
    Thermometer,
    Droplets,
    Wind,
    Gauge,
    Eye,
    Compass,
    X,
    User,
    LogOut,
    Settings,
    AlertCircle,
    Sun,
    Leaf,
    Waves,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";

import "./WeatherData.css";


/* =========================================================
   SUMMARY DATA
========================================================= */

const summaryCards = [
    {
        title: "Rainfall Stations",
        value: "78",
        subtitle: "Active Stations",
        statusLeft: "75 Online",
        statusRight: "3 Offline",
        icon: CloudRain,
        className: "rainfall",
    },
    {
        title: "Weather Stations",
        value: "24",
        subtitle: "Active Stations",
        statusLeft: "23 Online",
        statusRight: "1 Offline",
        icon: RadioTower,
        className: "weather",
    },
    {
        title: "Satellite Sources",
        value: "5",
        subtitle: "Active Sources",
        statusLeft: "All Online",
        statusRight: "",
        icon: Satellite,
        className: "satellite",
    },
    {
        title: "Data Layers",
        value: "12",
        subtitle: "Available Layers",
        statusLeft: "10 Active",
        statusRight: "2 Inactive",
        icon: Layers,
        className: "layers",
    },
];


/* =========================================================
   RAINFALL DATA
========================================================= */

const rainfallByRange = {
    "1h": [
        {
            name: "Uttarkashi",
            value: "12.6",
            x: 30,
            y: 24,
            size: 58,
            level: "medium",
        },
        {
            name: "Dehradun",
            value: "18.4",
            x: 13,
            y: 43,
            size: 67,
            level: "high",
        },
        {
            name: "Selected District",
            value: "21.2",
            x: 31,
            y: 53,
            size: 72,
            level: "high",
        },
        {
            name: "Rudraprayag",
            value: "15.6",
            x: 52,
            y: 35,
            size: 62,
            level: "medium",
        },
        {
            name: "Chamoli",
            value: "10.3",
            x: 69,
            y: 48,
            size: 55,
            level: "medium",
        },
        {
            name: "Pauri Garhwal",
            value: "17.2",
            x: 49,
            y: 59,
            size: 65,
            level: "high",
        },
        {
            name: "Haridwar",
            value: "5.7",
            x: 18,
            y: 65,
            size: 45,
            level: "low",
        },
        {
            name: "Nainital",
            value: "8.6",
            x: 64,
            y: 71,
            size: 48,
            level: "low",
        },
        {
            name: "Almora",
            value: "7.2",
            x: 80,
            y: 64,
            size: 46,
            level: "low",
        },
    ],

    "24H": [
        {
            name: "Uttarkashi",
            value: "85.6",
            x: 30,
            y: 24,
            size: 72,
            level: "medium",
        },
        {
            name: "Dehradun",
            value: "132.4",
            x: 13,
            y: 43,
            size: 82,
            level: "high",
        },
        {
            name: "Selected District",
            value: "135.2",
            x: 31,
            y: 53,
            size: 88,
            level: "high",
        },
        {
            name: "Rudraprayag",
            value: "98.6",
            x: 52,
            y: 35,
            size: 76,
            level: "medium",
        },
        {
            name: "Chamoli",
            value: "76.3",
            x: 69,
            y: 48,
            size: 70,
            level: "medium",
        },
        {
            name: "Pauri Garhwal",
            value: "112.4",
            x: 49,
            y: 59,
            size: 82,
            level: "high",
        },
        {
            name: "Haridwar",
            value: "28.7",
            x: 18,
            y: 65,
            size: 54,
            level: "low",
        },
        {
            name: "Nainital",
            value: "45.6",
            x: 64,
            y: 71,
            size: 60,
            level: "low",
        },
        {
            name: "Almora",
            value: "38.2",
            x: 80,
            y: 64,
            size: 54,
            level: "low",
        },
    ],

    "7D": [
        {
            name: "Uttarkashi",
            value: "214.6",
            x: 30,
            y: 24,
            size: 88,
            level: "high",
        },
        {
            name: "Dehradun",
            value: "286.4",
            x: 13,
            y: 43,
            size: 94,
            level: "high",
        },
        {
            name: "Selected District",
            value: "312.2",
            x: 31,
            y: 53,
            size: 100,
            level: "high",
        },
        {
            name: "Rudraprayag",
            value: "245.6",
            x: 52,
            y: 35,
            size: 90,
            level: "high",
        },
        {
            name: "Chamoli",
            value: "193.3",
            x: 69,
            y: 48,
            size: 82,
            level: "medium",
        },
        {
            name: "Pauri Garhwal",
            value: "268.4",
            x: 49,
            y: 59,
            size: 94,
            level: "high",
        },
        {
            name: "Haridwar",
            value: "104.7",
            x: 18,
            y: 65,
            size: 69,
            level: "medium",
        },
        {
            name: "Nainital",
            value: "156.6",
            x: 64,
            y: 71,
            size: 78,
            level: "medium",
        },
        {
            name: "Almora",
            value: "138.2",
            x: 80,
            y: 64,
            size: 74,
            level: "medium",
        },
    ],

    "30D": [
        {
            name: "Uttarkashi",
            value: "428.6",
            x: 30,
            y: 24,
            size: 100,
            level: "high",
        },
        {
            name: "Dehradun",
            value: "512.4",
            x: 13,
            y: 43,
            size: 106,
            level: "high",
        },
        {
            name: "Selected District",
            value: "546.2",
            x: 31,
            y: 53,
            size: 112,
            level: "high",
        },
        {
            name: "Rudraprayag",
            value: "478.6",
            x: 52,
            y: 35,
            size: 104,
            level: "high",
        },
        {
            name: "Chamoli",
            value: "392.3",
            x: 69,
            y: 48,
            size: 96,
            level: "high",
        },
        {
            name: "Pauri Garhwal",
            value: "484.4",
            x: 49,
            y: 59,
            size: 106,
            level: "high",
        },
        {
            name: "Haridwar",
            value: "214.7",
            x: 18,
            y: 65,
            size: 82,
            level: "medium",
        },
        {
            name: "Nainital",
            value: "266.6",
            x: 64,
            y: 71,
            size: 88,
            level: "medium",
        },
        {
            name: "Almora",
            value: "238.2",
            x: 80,
            y: 64,
            size: 82,
            level: "medium",
        },
    ],
};


/* =========================================================
   HOURLY FORECAST
========================================================= */

const hourlyForecast = [
    {
        time: "Now",
        temp: "24.8°",
        type: "Light Rain",
    },
    {
        time: "11 AM",
        temp: "25.1°",
        type: "Cloudy",
    },
    {
        time: "12 PM",
        temp: "25.8°",
        type: "Light Rain",
    },
    {
        time: "1 PM",
        temp: "26.2°",
        type: "Rain",
    },
    {
        time: "2 PM",
        temp: "26.0°",
        type: "Cloudy",
    },
    {
        time: "3 PM",
        temp: "25.5°",
        type: "Rain",
    },
    {
        time: "4 PM",
        temp: "24.9°",
        type: "Rain",
    },
    {
        time: "5 PM",
        temp: "24.3°",
        type: "Cloudy",
    },
];


/* =========================================================
   DATA SOURCES
========================================================= */

const dataSources = [
    {
        source: "IMD Rainfall",
        type: "Rainfall",
        coverage: "Selected Region",
        resolution: "Point",
        status: "Live",
        updated: "30 Aug 2026, 10:25 AM",
    },
    {
        source: "IMD Weather Stations",
        type: "Weather",
        coverage: "Selected Region",
        resolution: "Point",
        status: "Live",
        updated: "30 Aug 2026, 10:20 AM",
    },
    {
        source: "INSAT-3DR",
        type: "Satellite",
        coverage: "Selected Region",
        resolution: "4 km",
        status: "Live",
        updated: "30 Aug 2026, 10:15 AM",
    },
    {
        source: "GPM IMERG",
        type: "Rainfall (Satellite)",
        coverage: "Global",
        resolution: "10 km",
        status: "Live",
        updated: "30 Aug 2026, 09:55 AM",
    },
    {
        source: "SMAP",
        type: "Soil Moisture",
        coverage: "Global",
        resolution: "9 km",
        status: "Live",
        updated: "30 Aug 2026, 09:40 AM",
    },
    {
        source: "SRTM DEM",
        type: "Elevation",
        coverage: "Selected Region",
        resolution: "30 m",
        status: "Live",
        updated: "30 Aug 2026, 09:30 AM",
    },
    {
        source: "River Network",
        type: "Hydrology",
        coverage: "Selected Region",
        resolution: "Vector",
        status: "Live",
        updated: "30 Aug 2026, 09:25 AM",
    },
    {
        source: "Historical Flood Data",
        type: "Event Data",
        coverage: "Selected Region",
        resolution: "Point",
        status: "Live",
        updated: "30 Aug 2026, 08:50 AM",
    },
];


/* =========================================================
   COMPLETENESS
========================================================= */

const completenessData = [
    {
        name: "Rainfall",
        value: 95,
        className: "green",
    },
    {
        name: "Weather",
        value: 90,
        className: "green",
    },
    {
        name: "Soil Moisture",
        value: 78,
        className: "yellow",
    },
    {
        name: "River Data",
        value: 92,
        className: "green",
    },
    {
        name: "DEM / Elevation",
        value: 100,
        className: "green",
    },
    {
        name: "Historical Floods",
        value: 65,
        className: "orange",
    },
];


/* =========================================================
   COVERAGE DATA
========================================================= */

const coverageData = [
    {
        name: "Rainfall",
        subtitle: "Ground & Satellite Sources",
        value: 95,
        status: "Excellent",
        icon: CloudRain,
        iconClass: "coverage-rainfall",
        barClass: "bar-green",
        statusClass: "excellent",
    },
    {
        name: "Weather",
        subtitle: "Meteorological Stations",
        value: 90,
        status: "Excellent",
        icon: Sun,
        iconClass: "coverage-weather",
        barClass: "bar-blue",
        statusClass: "excellent",
    },
    {
        name: "Soil Moisture",
        subtitle: "Satellite & Model Data",
        value: 78,
        status: "Good",
        icon: Leaf,
        iconClass: "coverage-soil",
        barClass: "bar-yellow",
        statusClass: "good",
    },
    {
        name: "River Data",
        subtitle: "Hydrological Network",
        value: 92,
        status: "Excellent",
        icon: Waves,
        iconClass: "coverage-river",
        barClass: "bar-green",
        statusClass: "excellent",
    },
];


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
    title,
    value,
    subtitle,
    statusLeft,
    statusRight,
    icon: Icon,
    className,
}) {
    return (
        <div className="weather-summary-card">
            <div className="summary-card-header">
                <span className="summary-title">{title}</span>
                <div className={`weather-summary-icon ${className}`}>
                    <Icon size={19} strokeWidth={1.8} />
                </div>
            </div>

            <div className="summary-card-body">
                <strong className="summary-value">{value}</strong>
                <span className="summary-subtitle">{subtitle}</span>
            </div>

            <div className="summary-status-row">
                {statusLeft && (
                    <span className="summary-pill online">
                        <i></i>
                        {statusLeft}
                    </span>
                )}

                {statusRight && (
                    <span className="summary-pill offline">
                        <i></i>
                        {statusRight}
                    </span>
                )}
            </div>
        </div>
    );
}


/* =========================================================
   FORECAST ICON
========================================================= */

function ForecastIcon({ type }) {
    if (type === "Rain" || type === "Light Rain" || type === "Heavy Rain") {
        return (
            <CloudRain
                size={20}
                strokeWidth={1.8}
                className="forecast-svg rain"
            />
        );
    }

    if (type === "Clear" || type === "Sunny") {
        return (
            <Sun
                size={20}
                strokeWidth={1.8}
                className="forecast-svg sun"
            />
        );
    }

    return (
        <Cloud
            size={20}
            strokeWidth={1.8}
            className="forecast-svg cloud"
        />
    );
}


/* =========================================================
   WEATHER DATA
========================================================= */

function WeatherData({ onNavigate }) {
    const {
        location,
        weather,
        terrain,
        history,
        alerts,
        activeAlertCount,
        lastUpdate,
        apiOnline,
        refreshData,
        isDetectingLocation,
        useCurrentLocation,
        loading: contextLoading,
    } = useContext(LocationContext) || {};

    const { user } = useContext(AuthContext) || {};

    const [selectedRange, setSelectedRange] = useState("24H");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showCoverage, setShowCoverage] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (refreshData) {
                await refreshData();
            }
        } catch (err) {
            console.error("Refresh error:", err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const isLive = apiOnline !== false;
    const currentLocationName =
        location?.city && location.city !== "Unknown"
            ? location.city
            : (location?.district && location.district !== "Unknown"
                ? location.district
                : (location?.name || "Selected District"));

    const currentRegionName =
        location?.state && location.state !== "Unknown"
            ? location.state
            : (location?.district || "Selected Region");

    const displayLocationText = useMemo(() => {
        if (!location) return "Selected Location, Selected Region";
        const primary = location.city && location.city !== "Unknown"
            ? location.city
            : (location.district && location.district !== "Unknown"
                ? location.district
                : location.name);
        const secondary = location.state && location.state !== "Unknown"
            ? location.state
            : (location.district && location.district !== "Unknown" && location.district !== primary
                ? location.district
                : "");
        return secondary ? `${primary}, ${secondary}` : primary;
    }, [location]);

    const dynamicSummaryCards = useMemo(() => [
        {
            title: "Rainfall Stations",
            value: isLive ? "78" : "0",
            subtitle: "Active Stations",
            statusLeft: isLive ? "75 Online" : "0 Online",
            statusRight: isLive ? "3 Offline" : "78 Offline",
            icon: CloudRain,
            className: "rainfall",
        },
        {
            title: "Weather Stations",
            value: isLive ? "24" : "0",
            subtitle: "Active Stations",
            statusLeft: isLive ? "23 Online" : "0 Online",
            statusRight: isLive ? "1 Offline" : "24 Offline",
            icon: RadioTower,
            className: "weather",
        },
        {
            title: "Satellite Sources",
            value: "5",
            subtitle: "Active Sources",
            statusLeft: isLive ? "All Online" : "Connecting",
            statusRight: "",
            icon: Satellite,
            className: "satellite",
        },
        {
            title: "Data Layers",
            value: terrain?.available ? "12" : "10",
            subtitle: "Available Layers",
            statusLeft: terrain?.available ? "11 Active" : "10 Active",
            statusRight: terrain?.available ? "1 Inactive" : "2 Inactive",
            icon: Layers,
            className: "layers",
        },
    ], [isLive, terrain]);

    const activeRainfallData = useMemo(() => {
        const base = rainfallByRange[selectedRange] || rainfallByRange["24H"];
        let liveVal = "135.2";
        if (selectedRange === "1h") {
            liveVal = weather?.rain_1h != null ? Number(weather.rain_1h).toFixed(1) : "12.6";
        } else if (selectedRange === "24H") {
            liveVal = weather?.rain_24h != null ? Number(weather.rain_24h).toFixed(1) : "135.2";
        } else if (selectedRange === "7D") {
            if (history && history.length > 0) {
                const sum7d = history.slice(-7).reduce((acc, curr) => acc + (Number(curr.rainfall) || 0), 0);
                liveVal = sum7d > 0 ? sum7d.toFixed(1) : "214.6";
            } else {
                liveVal = "214.6";
            }
        } else if (selectedRange === "30D") {
            if (history && history.length > 0) {
                const sumAll = history.reduce((acc, curr) => acc + (Number(curr.rainfall) || 0), 0);
                liveVal = (sumAll * 2.2).toFixed(1);
            } else {
                liveVal = "650.4";
            }
        }

        const numVal = parseFloat(liveVal) || 0;
        const level = numVal > 150 ? "high" : numVal > 50 ? "medium" : "low";

        const alreadyInBase = base.some(
            (i) => i.name.toLowerCase() === currentLocationName.toLowerCase()
        );

        return base
            .map((item) => {
                if (alreadyInBase) {
                    if (item.name.toLowerCase() === currentLocationName.toLowerCase()) {
                        return {
                            ...item,
                            value: liveVal,
                            level: level,
                        };
                    }
                    if (item.name === "Selected District") {
                        return null;
                    }
                } else {
                    if (item.name === "Selected District") {
                        return {
                            ...item,
                            name: currentLocationName,
                            value: liveVal,
                            level: level,
                        };
                    }
                }
                return item;
            })
            .filter(Boolean);
    }, [selectedRange, currentLocationName, weather, history]);

    const currentTemp = weather?.temperature != null
        ? `${Number(weather.temperature).toFixed(1)}°C`
        : "24.8°C";

    const currentWeatherType = weather?.weather_desc ||
        (weather?.rainfall_mm_hr > 5 ? "Heavy Rain" :
         weather?.rainfall_mm_hr > 0 ? "Light Rain" : "Partly Cloudy");

    const feelsLike = weather?.feels_like != null
        ? `${Number(weather.feels_like).toFixed(1)}°C`
        : (weather?.temperature != null ? `${(Number(weather.temperature) + 1.2).toFixed(1)}°C` : "24.2°C");

    const humidity = weather?.humidity != null
        ? `${Math.round(weather.humidity)}%`
        : "88%";

    const windSpeed = weather?.wind_speed != null
        ? `${Number(weather.wind_speed).toFixed(1)} km/h`
        : "6.2 km/h";

    const pressure = weather?.pressure != null
        ? `${Math.round(weather.pressure)} hPa`
        : "1006 hPa";

    const visibility = weather?.visibility != null
        ? `${Number(weather.visibility).toFixed(1)} km`
        : "6.5 km";

    const windDirection = weather?.wind_direction || "NE";

    const activeHourlyForecast = useMemo(() => {
        if (weather?.hourly_forecast && weather.hourly_forecast.length > 0) {
            return weather.hourly_forecast.slice(0, 7);
        }
        return hourlyForecast;
    }, [weather]);

    const formattedLastUpdate = useMemo(() => {
        const d = lastUpdate instanceof Date ? lastUpdate : new Date();
        const dateStr = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const timeStr = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        return `${dateStr}, ${timeStr}`;
    }, [lastUpdate]);

    const dynamicDataSources = useMemo(() => [
        {
            source: "IMD Rainfall",
            type: "Rainfall",
            coverage: currentRegionName,
            resolution: "Point",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "IMD Weather Stations",
            type: "Weather",
            coverage: currentRegionName,
            resolution: "Point",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "INSAT-3DR",
            type: "Satellite",
            coverage: currentRegionName,
            resolution: "4 km",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "GPM IMERG",
            type: "Rainfall (Satellite)",
            coverage: "Global",
            resolution: "10 km",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "SMAP",
            type: "Soil Moisture",
            coverage: "Global",
            resolution: "9 km",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "SRTM DEM",
            type: "Elevation",
            coverage: currentRegionName,
            resolution: "30 m",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "River Network",
            type: "Hydrology",
            coverage: currentRegionName,
            resolution: "Vector",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
        {
            source: "Historical Flood Data",
            type: "Event Data",
            coverage: currentRegionName,
            resolution: "Point",
            status: isLive ? "Live" : "Offline",
            updated: formattedLastUpdate,
        },
    ], [isLive, currentRegionName, formattedLastUpdate]);


    /* =======================================================
       NAVIGATION
    ======================================================= */

    const handleNavigation = (pageName) => {

        if (onNavigate) {
            onNavigate(pageName);
        }

    };


    return (

        <div className="weather-page">


            {/* =====================================================
          SIDEBAR
      ===================================================== */}

            <Sidebar
                activePage="weather"
                onNavigate={handleNavigation}
                alertCount={activeAlertCount}
            />


            {/* =====================================================
          MAIN
      ===================================================== */}

            <div className="weather-main">


                {/* ===================================================
            HEADER
        =================================================== */}

                <Navbar 
        title="Weather & Atmospheric Data" 
        subtitle="Real-time meteorological monitoring and precipitation tracking."
    >
        <div style={{ display: 'flex', gap: '12px', marginRight: '16px' }}>

            <button className="weather-refresh-button" type="button" onClick={handleRefresh} disabled={isRefreshing || contextLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0ea5e9', border: 'none', borderRadius: '8px', fontSize: '0.85rem', color: 'white', cursor: (isRefreshing || contextLoading) ? 'not-allowed' : 'pointer', opacity: (isRefreshing || contextLoading) ? 0.7 : 1 }}>
                <RefreshCw size={15} className={isRefreshing || contextLoading ? "spin-animation" : ""} />
                {isRefreshing || contextLoading ? "Refreshing..." : "Refresh Data"}
            </button>
    
        </div>
    </Navbar>


                {/* ===================================================
            CONTENT
        =================================================== */}

                <main className="weather-content">


                    {/* =================================================
              SUMMARY
          ================================================= */}

                    <section className="weather-summary-grid">

                        {dynamicSummaryCards.map(
                            (card) => (

                                <SummaryCard
                                    key={card.title}
                                    {...card}
                                />

                            )
                        )}


                        {/* DATA QUALITY */}

                        <div className="weather-summary-card">

                            <div className="summary-card-header">
                                <span className="summary-title">
                                    Data Quality
                                </span>
                                <div className="weather-summary-icon quality">
                                    <ShieldCheck
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                </div>
                            </div>

                            <div className="summary-card-body">
                                <strong className="summary-value">
                                    {isLive ? "92%" : "72%"}
                                </strong>
                                <span className="summary-subtitle">
                                    Overall Quality
                                </span>
                            </div>

                            <div className="summary-status-row">
                                <span className={`summary-pill ${isLive ? "online" : "warning"}`}>
                                    <i></i>
                                    {isLive ? "Good Condition" : "Fair Condition"}
                                </span>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
              TOP GRID
          ================================================= */}

                    <section className="weather-top-grid">


                        {/* RAINFALL */}

                        <div className="weather-card rainfall-card">

                            <div className="weather-card-header">

                                <div className="weather-card-title-wrap">
                                    <h2>
                                        Real-time Rainfall (mm)
                                        <Info size={14} className="header-info-icon" />
                                    </h2>
                                </div>

                                <div className="range-tabs-pill">

                                    {[
                                        "1h",
                                        "24H",
                                        "7D",
                                        "30D",
                                    ].map(
                                        (range) => (

                                            <button
                                                key={range}
                                                type="button"
                                                className={`range-tab-btn ${
                                                    selectedRange === range
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedRange(
                                                        range
                                                    )
                                                }
                                            >
                                                {range}
                                            </button>

                                        )
                                    )}

                                </div>

                            </div>


                            <div className="rainfall-map-layout">

                                <div className="rainfall-map">

                                    <div className="radar-grid-bg"></div>

                                    <div className="uttarakhand-shape">

                                        {activeRainfallData.map(
                                            (location, idx) => (

                                                <div
                                                    key={`${location.name}-${idx}`}
                                                    className={`rainfall-bubble ${location.level}`}
                                                    style={{
                                                        left:
                                                            `${location.x}%`,

                                                        top:
                                                            `${location.y}%`,

                                                        width:
                                                            `${location.size}px`,

                                                        height:
                                                            `${location.size}px`,
                                                    }}
                                                />

                                            )
                                        )}


                                        {activeRainfallData.map(
                                            (location, idx) => (

                                                <div
                                                    key={`${location.name}-label-${idx}`}
                                                    className="rainfall-label"
                                                    style={{
                                                        left:
                                                            `${location.x}%`,

                                                        top:
                                                            `${location.y}%`,
                                                    }}
                                                >

                                                    <strong>
                                                        {location.name}
                                                    </strong>

                                                    <span>
                                                        {location.value}
                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>


                                    <div className="rainfall-map-footer">

                                        <span>Data represents total rainfall for the selected period</span>

                                    </div>

                                </div>


                                {/* LEGEND */}

                                <div className="rainfall-legend">

                                    <h3>
                                        Rainfall (mm)
                                    </h3>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-1"></i>
                                        <span>&gt; 200</span>
                                    </div>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-2"></i>
                                        <span>150 - 200</span>
                                    </div>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-3"></i>
                                        <span>100 - 150</span>
                                    </div>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-4"></i>
                                        <span>50 - 100</span>
                                    </div>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-5"></i>
                                        <span>25 - 50</span>
                                    </div>

                                    <div className="rainfall-legend-row">
                                        <i className="legend-rain-6"></i>
                                        <span>&lt; 25</span>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* CURRENT WEATHER */}

                        <div className="weather-card current-weather-card">

                            <div className="weather-card-header">

                                <div className="weather-card-title-wrap">
                                    <h2>
                                        Current Weather Overview
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className={`weather-location-badge-btn ${location?.source === "gps" ? "is-gps" : ""}`}
                                    onClick={useCurrentLocation}
                                    title="Click to detect and sync your current live location"
                                    disabled={isDetectingLocation}
                                >
                                    <Navigation size={13} className={`weather-location-pin ${isDetectingLocation ? "spin-animation" : ""}`} />
                                    <span>{isDetectingLocation ? "Detecting GPS location..." : displayLocationText}</span>
                                    <span className="location-source-chip">
                                        {isDetectingLocation ? "Detecting..." : (location?.source === "gps" ? "Live GPS" : "Auto Detect")}
                                    </span>
                                </button>

                            </div>


                            <div className="current-weather-main">

                                <div className="current-weather-hero">

                                    <div className="current-weather-icon-box">

                                        {currentWeatherType.includes("Rain") ? (
                                            <CloudRain
                                                size={46}
                                                strokeWidth={1.6}
                                            />
                                        ) : (
                                            <Cloud
                                                size={46}
                                                strokeWidth={1.6}
                                            />
                                        )}

                                    </div>

                                    <div className="current-weather-hero-meta">

                                        <strong className="current-weather-temp">
                                            {currentTemp}
                                        </strong>

                                        <span className="weather-condition-pill">
                                            {currentWeatherType}
                                        </span>

                                    </div>

                                </div>


                                <div className="weather-metrics">

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Thermometer size={13} className="metric-icon" />
                                            <span>Feels Like</span>
                                        </div>
                                        <strong>{feelsLike}</strong>
                                    </div>

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Droplets size={13} className="metric-icon" />
                                            <span>Humidity</span>
                                        </div>
                                        <strong>{humidity}</strong>
                                    </div>

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Wind size={13} className="metric-icon" />
                                            <span>Wind Speed</span>
                                        </div>
                                        <strong>{windSpeed}</strong>
                                    </div>

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Gauge size={13} className="metric-icon" />
                                            <span>Pressure</span>
                                        </div>
                                        <strong>{pressure}</strong>
                                    </div>

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Eye size={13} className="metric-icon" />
                                            <span>Visibility</span>
                                        </div>
                                        <strong>{visibility}</strong>
                                    </div>

                                    <div className="weather-metric-tile">
                                        <div className="metric-tile-header">
                                            <Compass size={13} className="metric-icon" />
                                            <span>Direction</span>
                                        </div>
                                        <strong>{windDirection}</strong>
                                    </div>

                                </div>

                            </div>


                            <div className="hourly-forecast-container">

                                <div className="hourly-forecast-track">

                                    {activeHourlyForecast.map(
                                        (item, idx) => {
                                            const isNow = item.time === "Now";
                                            return (
                                                <div
                                                    className={`forecast-item ${isNow ? "is-now" : ""}`}
                                                    key={`${item.time}-${idx}`}
                                                >

                                                    <span className="forecast-time">
                                                        {item.time}
                                                    </span>

                                                    <div className="forecast-icon-box">
                                                        <ForecastIcon
                                                            type={item.type}
                                                        />
                                                    </div>

                                                    <strong className="forecast-temp">
                                                        {item.temp}
                                                    </strong>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
              MIDDLE GRID
          ================================================= */}

                    <section className="weather-middle-grid">


                        {/* DATA SOURCES */}

                        <div className="weather-card sources-card">

                            <div className="weather-card-header">

                                <div className="weather-card-title-wrap">
                                    <h2>
                                        Data Sources Status
                                    </h2>
                                </div>

                                <span className="sources-count-badge">
                                    {dynamicDataSources.length} Connected
                                </span>

                            </div>


                            <div className="sources-table-wrapper">

                                <table className="sources-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Data Source
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Coverage
                                            </th>

                                            <th>
                                                Resolution
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Last Updated
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {dynamicDataSources.map(
                                            (item) => (

                                                <tr
                                                    key={item.source}
                                                >

                                                    <td>

                                                        <div className="source-name">

                                                            <span className="source-icon">

                                                                <Database
                                                                    size={14}
                                                                />

                                                            </span>

                                                            <span>{item.source}</span>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        <span className="source-type-pill">{item.type}</span>
                                                    </td>

                                                    <td>
                                                        <span className="source-coverage-text">{item.coverage}</span>
                                                    </td>

                                                    <td>
                                                        <span className="source-resolution-tag">{item.resolution}</span>
                                                    </td>

                                                    <td>

                                                        <span className="live-status-pill">

                                                            <i className="live-dot-pulse"></i>

                                                            {item.status}

                                                        </span>

                                                    </td>

                                                    <td className="source-updated">
                                                        {item.updated}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* RIGHT SIDE */}

                        <div className="weather-side-column">


                            {/* DATA QUALITY */}

                            <div className="weather-card quality-card">

                                <div className="weather-card-header">

                                    <h2>
                                        Data Quality Overview
                                    </h2>

                                </div>


                                <div className="quality-content">

                                    <div className="quality-donut">

                                        <div className="quality-donut-inner">

                                            <strong>
                                                92%
                                            </strong>

                                            <span>
                                                Overall Quality
                                            </span>

                                        </div>

                                    </div>


                                    <div className="quality-legend">

                                        <div>

                                            <i className="excellent"></i>

                                            <span>
                                                Excellent (90-100%)
                                            </span>

                                            <strong>
                                                55%
                                            </strong>

                                        </div>


                                        <div>

                                            <i className="good"></i>

                                            <span>
                                                Good (70-89%)
                                            </span>

                                            <strong>
                                                37%
                                            </strong>

                                        </div>


                                        <div>

                                            <i className="fair"></i>

                                            <span>
                                                Fair (50-70%)
                                            </span>

                                            <strong>
                                                6%
                                            </strong>

                                        </div>


                                        <div>

                                            <i className="poor"></i>

                                            <span>
                                                Poor (&lt;50%)
                                            </span>

                                            <strong>
                                                2%
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* DATA COMPLETENESS */}

                            <div className="weather-card completeness-card">

                                <div className="weather-card-header">

                                    <div>

                                        <h2>
                                            Data Completeness
                                        </h2>

                                        <span className="small-heading">
                                            Across key parameters
                                        </span>

                                    </div>

                                </div>


                                <div className="completeness-list">

                                    {completenessData.map(
                                        (item) => (

                                            <div
                                                className="completeness-row"
                                                key={item.name}
                                            >

                                                <span>
                                                    {item.name}
                                                </span>

                                                <div className="completeness-track">

                                                    <div
                                                        className={`completeness-fill ${item.className}`}
                                                        style={{
                                                            width:
                                                                `${item.value}%`,
                                                        }}
                                                    />

                                                </div>

                                                <strong>
                                                    {item.value}%
                                                </strong>

                                            </div>

                                        )
                                    )}

                                </div>


                                <button
                                    className="coverage-button"
                                    type="button"
                                    onClick={() =>
                                        setShowCoverage(true)
                                    }
                                >

                                    <Map
                                        size={14}
                                    />

                                    View Data Coverage Map

                                    <ArrowRight
                                        size={14}
                                    />

                                </button>

                            </div>

                        </div>

                    </section>

                </main>

            </div>


            {/* =====================================================
          DATA COVERAGE MODAL
      ===================================================== */}

            {showCoverage && (

                <div
                    className="coverage-modal-overlay"
                    onClick={() =>
                        setShowCoverage(false)
                    }
                >

                    <div
                        className="coverage-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="coverage-modal-header">

                            <div className="coverage-modal-title-area">

                                <div className="coverage-main-icon">

                                    <Map
                                        size={25}
                                        strokeWidth={1.8}
                                    />

                                </div>

                                <div>

                                    <h2>
                                        Data Coverage Map
                                    </h2>

                                    <p>
                                        Monitoring coverage across key
                                        weather and environmental datasets.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="coverage-close-button"
                                onClick={() =>
                                    setShowCoverage(false)
                                }
                            >

                                <X
                                    size={21}
                                />

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="coverage-modal-body">


                            {/* LEFT */}

                            <div className="coverage-overview-panel">

                                <div className="coverage-donut-large">

                                    <div className="coverage-donut-center">

                                        <strong>
                                            92%
                                        </strong>

                                        <span>
                                            Overall Coverage
                                        </span>

                                    </div>

                                </div>


                                <div className="coverage-legend-large">

                                    <div className="coverage-legend-item">

                                        <i className="legend-excellent"></i>

                                        <div>

                                            <strong>
                                                Excellent
                                            </strong>

                                            <span>
                                                90-100%
                                            </span>

                                        </div>

                                    </div>


                                    <div className="coverage-legend-item">

                                        <i className="legend-good"></i>

                                        <div>

                                            <strong>
                                                Good
                                            </strong>

                                            <span>
                                                70-89%
                                            </span>

                                        </div>

                                    </div>


                                    <div className="coverage-legend-item">

                                        <i className="legend-fair"></i>

                                        <div>

                                            <strong>
                                                Fair
                                            </strong>

                                            <span>
                                                50-70%
                                            </span>

                                        </div>

                                    </div>


                                    <div className="coverage-legend-item">

                                        <i className="legend-poor"></i>

                                        <div>

                                            <strong>
                                                Poor
                                            </strong>

                                            <span>
                                                &lt;50%
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* RIGHT */}

                            <div className="coverage-dataset-panel">

                                <div className="dataset-panel-header">

                                    <h3>
                                        Dataset Coverage
                                    </h3>

                                    <span>
                                        Across key parameters
                                    </span>

                                </div>


                                <div className="coverage-dataset-list">

                                    {coverageData.map(
                                        (item) => {

                                            const Icon =
                                                item.icon;

                                            return (

                                                <div
                                                    className="coverage-dataset-row"
                                                    key={item.name}
                                                >

                                                    <div
                                                        className={`coverage-item-icon ${item.iconClass}`}
                                                    >

                                                        <Icon
                                                            size={23}
                                                            strokeWidth={1.8}
                                                        />

                                                    </div>


                                                    <div className="coverage-item-info">

                                                        <strong>
                                                            {item.name}
                                                        </strong>

                                                        <span>
                                                            {item.subtitle}
                                                        </span>

                                                    </div>


                                                    <div className="coverage-item-progress">

                                                        <div className="coverage-progress-track">

                                                            <div
                                                                className={`coverage-progress-fill ${item.barClass}`}
                                                                style={{
                                                                    width:
                                                                        `${item.value}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>


                                                    <strong className="coverage-percent">
                                                        {item.value}%
                                                    </strong>


                                                    <span
                                                        className={`coverage-status ${item.statusClass}`}
                                                    >
                                                        {item.status}
                                                    </span>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="coverage-modal-footer">

                            <div className="coverage-footer-info">

                                <div className="coverage-footer-icon">

                                    <Info
                                        size={16}
                                    />

                                </div>

                                <p>
                                    Data coverage is calculated based on the
                                    availability and freshness of data across
                                    all sources.
                                </p>

                            </div>


                            <div className="coverage-footer-live">

                                <span className="live-dot"></span>

                                Updated in real-time

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default WeatherData;