import React, { useMemo, useState } from "react";

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
            x: 17,
            y: 68,
            size: 45,
            level: "low",
        },
        {
            name: "Nainital",
            value: "8.6",
            x: 65,
            y: 79,
            size: 48,
            level: "low",
        },
        {
            name: "Almora",
            value: "7.2",
            x: 81,
            y: 70,
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
            x: 17,
            y: 68,
            size: 54,
            level: "low",
        },
        {
            name: "Nainital",
            value: "45.6",
            x: 65,
            y: 79,
            size: 60,
            level: "low",
        },
        {
            name: "Almora",
            value: "38.2",
            x: 81,
            y: 70,
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
            x: 17,
            y: 68,
            size: 69,
            level: "medium",
        },
        {
            name: "Nainital",
            value: "156.6",
            x: 65,
            y: 79,
            size: 78,
            level: "medium",
        },
        {
            name: "Almora",
            value: "138.2",
            x: 81,
            y: 70,
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
            x: 17,
            y: 68,
            size: 82,
            level: "medium",
        },
        {
            name: "Nainital",
            value: "266.6",
            x: 65,
            y: 79,
            size: 88,
            level: "medium",
        },
        {
            name: "Almora",
            value: "238.2",
            x: 81,
            y: 70,
            size: 84,
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

            <div className={`weather-summary-icon ${className}`}>
                <Icon
                    size={25}
                    strokeWidth={1.8}
                />
            </div>

            <div className="weather-summary-content">

                <span className="summary-title">
                    {title}
                </span>

                <strong className="summary-value">
                    {value}
                </strong>

                <span className="summary-subtitle">
                    {subtitle}
                </span>

                <div className="summary-status-row">

                    <span className="summary-online">
                        <i></i>
                        {statusLeft}
                    </span>

                    {statusRight && (
                        <span className="summary-offline">
                            <i></i>
                            {statusRight}
                        </span>
                    )}

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   FORECAST ICON
========================================================= */

function ForecastIcon({ type }) {

    if (
        type === "Rain" ||
        type === "Light Rain"
    ) {
        return (
            <CloudRain
                size={19}
                strokeWidth={1.8}
            />
        );
    }

    return (
        <Cloud
            size={19}
            strokeWidth={1.8}
        />
    );
}


/* =========================================================
   WEATHER DATA
========================================================= */

function WeatherData({ onNavigate }) {

    const [selectedRange, setSelectedRange] =
        useState("24H");

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [showProfile, setShowProfile] =
        useState(false);

    const [showCoverage, setShowCoverage] =
        useState(false);


    const activeRainfallData =
        useMemo(
            () =>
                rainfallByRange[selectedRange] ||
                rainfallByRange["24H"],
            [selectedRange]
        );


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
            />


            {/* =====================================================
          MAIN
      ===================================================== */}

            <div className="weather-main">


                {/* ===================================================
            HEADER
        =================================================== */}

                <header className="weather-header">


                    {/* TITLE */}

                    <div className="weather-header-title">

                        <h1>
                            Weather &amp; Data
                        </h1>

                        <p>
                            Monitor real-time weather conditions and data
                            sources
                        </p>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="weather-header-right">


                        {/* REFRESH */}

                        <button
                            className="weather-refresh-button"
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >

                            <RefreshCw
                                size={15}
                            />

                            Refresh Data

                        </button>


                        {/* NOTIFICATION */}

                        <div className="header-menu-wrapper">

                            <button
                                className="weather-notification"
                                type="button"
                                onClick={() =>
                                    setShowNotifications(
                                        (value) => !value
                                    )
                                }
                            >

                                <Bell
                                    size={17}
                                />

                                <span>
                                    7
                                </span>

                            </button>


                            {showNotifications && (

                                <div className="header-dropdown notification-dropdown">

                                    <div className="dropdown-title">
                                        Notifications
                                    </div>


                                    <div className="notification-item">

                                        <div className="notification-icon warning">

                                            <AlertCircle
                                                size={15}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                Heavy rainfall detected
                                            </strong>

                                            <span>
                                                Selected Location Garhwal
                                            </span>

                                        </div>

                                    </div>


                                    <div className="notification-item">

                                        <div className="notification-icon success">

                                            <Check
                                                size={15}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                Weather data updated
                                            </strong>

                                            <span>
                                                All stations online
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* PROFILE */}

                        <div className="header-menu-wrapper">

                            <button
                                className="weather-profile"
                                type="button"
                                onClick={() =>
                                    setShowProfile(
                                        (value) => !value
                                    )
                                }
                            >

                                <div className="weather-profile-avatar">

                                    <User
                                        size={18}
                                    />

                                </div>

                                <div className="weather-profile-details">

                                    <strong>
                                        Souvik Konar
                                    </strong>

                                    <span>
                                        Admin
                                    </span>

                                </div>

                                <ChevronDown
                                    size={13}
                                />

                            </button>


                            {showProfile && (

                                <div className="header-dropdown profile-dropdown">

                                    <button type="button">

                                        <User
                                            size={14}
                                        />

                                        My Profile

                                    </button>


                                    <button type="button">

                                        <Settings
                                            size={14}
                                        />

                                        Settings

                                    </button>


                                    <button
                                        type="button"
                                        className="logout-item"
                                        onClick={() => {

                                            localStorage.removeItem(
                                                "isLoggedIn"
                                            );

                                            window.location.href = "/";

                                        }}
                                    >

                                        <LogOut
                                            size={14}
                                        />

                                        Logout

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </header>


                {/* ===================================================
            CONTENT
        =================================================== */}

                <main className="weather-content">


                    {/* =================================================
              SUMMARY
          ================================================= */}

                    <section className="weather-summary-grid">

                        {summaryCards.map(
                            (card) => (

                                <SummaryCard
                                    key={card.title}
                                    {...card}
                                />

                            )
                        )}


                        {/* DATA QUALITY */}

                        <div className="weather-summary-card">

                            <div className="weather-summary-icon quality">

                                <ShieldCheck
                                    size={25}
                                    strokeWidth={1.8}
                                />

                            </div>

                            <div className="weather-summary-content">

                                <span className="summary-title">
                                    Data Quality
                                </span>

                                <strong className="summary-value">
                                    92%
                                </strong>

                                <span className="summary-subtitle">
                                    Overall Quality
                                </span>

                                <span className="quality-good">
                                    Good
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

                                <h2>

                                    Real-time Rainfall (mm)

                                    <Info
                                        size={13}
                                    />

                                </h2>


                                <div className="range-tabs">

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
                                                className={
                                                    selectedRange === range
                                                        ? "active"
                                                        : ""
                                                }
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

                                    <div className="uttarakhand-shape">

                                        {activeRainfallData.map(
                                            (location) => (

                                                <div
                                                    key={location.name}
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
                                            (location) => (

                                                <div
                                                    key={`${location.name}-label`}
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

                                        Data represents total rainfall for
                                        the selected period

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

                                <h2>
                                    Current Weather Overview
                                </h2>

                                <span className="weather-location">
                                    Selected Location, Selected Region
                                </span>

                            </div>


                            <div className="current-weather-main">

                                <div className="current-weather-summary">

                                    <div className="current-weather-icon">

                                        <CloudRain
                                            size={43}
                                            strokeWidth={1.5}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            24.8°C
                                        </strong>

                                        <span>
                                            Light Rain
                                        </span>

                                    </div>

                                </div>


                                <div className="weather-metrics">

                                    <div>
                                        <span>Feels Like</span>
                                        <strong>24.2°C</strong>
                                    </div>

                                    <div>
                                        <span>Humidity</span>
                                        <strong>88%</strong>
                                    </div>

                                    <div>
                                        <span>Wind Speed</span>
                                        <strong>6.2 km/h</strong>
                                    </div>

                                    <div>
                                        <span>Pressure</span>
                                        <strong>1006 hPa</strong>
                                    </div>

                                    <div>
                                        <span>Visibility</span>
                                        <strong>6.5 km</strong>
                                    </div>

                                    <div>
                                        <span>Direction</span>
                                        <strong>NE</strong>
                                    </div>

                                </div>

                            </div>


                            <div className="hourly-forecast">

                                {hourlyForecast.map(
                                    (item) => (

                                        <div
                                            className="forecast-item"
                                            key={item.time}
                                        >

                                            <span className="forecast-time">
                                                {item.time}
                                            </span>

                                            <ForecastIcon
                                                type={item.type}
                                            />

                                            <strong>
                                                {item.temp}
                                            </strong>

                                        </div>

                                    )
                                )}

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

                                <h2>
                                    Data Sources Status
                                </h2>

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

                                        {dataSources.map(
                                            (item) => (

                                                <tr
                                                    key={item.source}
                                                >

                                                    <td>

                                                        <div className="source-name">

                                                            <span className="source-icon">

                                                                <Database
                                                                    size={13}
                                                                />

                                                            </span>

                                                            {item.source}

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {item.type}
                                                    </td>

                                                    <td>
                                                        {item.coverage}
                                                    </td>

                                                    <td>
                                                        {item.resolution}
                                                    </td>

                                                    <td>

                                                        <span className="live-status">

                                                            <i></i>

                                                            {item.status}

                                                        </span>

                                                    </td>

                                                    <td>
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