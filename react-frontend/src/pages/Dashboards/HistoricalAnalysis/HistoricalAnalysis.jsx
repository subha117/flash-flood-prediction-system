import React, { useMemo, useState, useEffect } from "react";
import { indiaStatesAndDistricts } from "../../../utils/indiaStates";

import {
    CalendarDays,
    Download,
    Bell,
    User,
    ChevronDown,
    RotateCcw,
    SlidersHorizontal,
    Map,
    BarChart3,
    TrendingUp,
    Activity,
    AlertTriangle,
    X,
    Eye,
    Search,
    ChevronLeft,
    ChevronRight,
    CloudRain,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar/Sidebar";

import "./HistoricalAnalysis.css";


/* =========================================================
   HISTORICAL EVENT DATA
========================================================= */

const API_URL = 'http://127.0.0.1:8000/api';

const historicalEvents = [
    {
        date: "30 Aug 2026, 10:30 AM",
        location: "Tehri",
        district: "Tehri Garhwal",
        rainfall24: 135.2,
        maxRainfall1: 42.5,
        probability: 82,
        risk: "HIGH",
        actual: "Yes",
        impact: "High",
        source: "IMD, CWC",
    },
    {
        date: "30 Aug 2026, 09:15 AM",
        location: "Rudraprayag",
        district: "Rudraprayag",
        rainfall24: 98.6,
        maxRainfall1: 28.3,
        probability: 62,
        risk: "MODERATE",
        actual: "No",
        impact: "Low",
        source: "IMD",
    },
    {
        date: "29 Aug 2026, 11:45 PM",
        location: "Chamoli",
        district: "Chamoli",
        rainfall24: 176.3,
        maxRainfall1: 56.9,
        probability: 89,
        risk: "CRITICAL",
        actual: "Yes",
        impact: "Very High",
        source: "IMD, CWC",
    },
    {
        date: "29 Aug 2026, 06:20 PM",
        location: "Pauri Garhwal",
        district: "Pauri Garhwal",
        rainfall24: 112.4,
        maxRainfall1: 35.7,
        probability: 58,
        risk: "MODERATE",
        actual: "No",
        impact: "Low",
        source: "IMD",
    },
    {
        date: "29 Aug 2026, 02:10 PM",
        location: "Uttarkashi",
        district: "Uttarkashi",
        rainfall24: 124.8,
        maxRainfall1: 37.6,
        probability: 67,
        risk: "HIGH",
        actual: "No",
        impact: "Moderate",
        source: "IMD",
    },
    {
        date: "28 Aug 2026, 08:40 PM",
        location: "Nainital",
        district: "Nainital",
        rainfall24: 91.4,
        maxRainfall1: 31.8,
        probability: 49,
        risk: "MODERATE",
        actual: "No",
        impact: "Low",
        source: "IMD",
    },
    {
        date: "27 Aug 2026, 05:30 PM",
        location: "Haridwar",
        district: "Haridwar",
        rainfall24: 72.6,
        maxRainfall1: 21.4,
        probability: 31,
        risk: "LOW",
        actual: "No",
        impact: "Low",
        source: "IMD",
    },
    {
        date: "25 Aug 2026, 01:15 PM",
        location: "Almora",
        district: "Almora",
        rainfall24: 105.2,
        maxRainfall1: 33.1,
        probability: 54,
        risk: "MODERATE",
        actual: "No",
        impact: "Moderate",
        source: "IMD",
    },
];


/* =========================================================
   CHART DATA
========================================================= */

const floodEventChart = [
    68, 51, 36, 43, 31, 37, 45, 28, 35, 40,
    31, 45, 51, 42, 69, 53, 37, 47, 52, 57,
    48, 60, 54, 72, 66, 43, 39, 34, 42, 51,
    45, 38, 49, 54, 58, 44, 36, 52, 61, 49,
];

const highRiskChart = [
    63, 28, 36, 31, 43, 19, 34, 38, 25, 46,
    55, 30, 39, 41, 69, 36, 45, 53, 60, 49,
    56, 65, 72, 58, 43, 39, 33, 31, 43, 51,
    59, 50, 61, 39, 48, 55, 50, 56, 62, 42,
];

const rainfallChart = [
    58, 72, 45, 63, 39, 55, 80, 62, 74, 48,
    56, 94, 129, 75, 286, 91, 66, 82, 71, 56,
    113, 95, 125, 78, 84, 76, 62, 109, 133, 78,
    61, 96, 69, 80, 48, 67, 88, 72, 54, 105,
];

const rainfallFloodLine = [
    15, 8, 22, 17, 29, 21, 16, 25, 18, 23,
    31, 27, 35, 22, 48, 36, 29, 40, 46, 32,
    54, 41, 57, 49, 35, 42, 28, 38, 44, 33,
    51, 47, 39, 55, 42, 48, 36, 45, 31, 40,
];

const predictionLine = [
    61, 47, 74, 52, 67, 44, 82, 55, 63, 49,
    71, 58, 75, 61, 88, 56, 69, 76, 52, 81,
    68, 73, 62, 79, 55, 70, 48, 65, 76, 57,
];

const actualLine = [
    48, 55, 43, 61, 39, 50, 31, 45, 57, 41,
    54, 49, 63, 39, 57, 36, 48, 53, 32, 45,
    58, 39, 47, 31, 42, 36, 50, 28, 41, 37,
];


/* =========================================================
   HELPERS
========================================================= */

function buildPolylinePoints(
    values,
    width,
    height,
    maxValue
) {
    if (!values.length) {
        return "";
    }

    return values
        .map((value, index) => {

            const x =
                (index /
                    Math.max(values.length - 1, 1)) *
                width;

            const y =
                height -
                (value / maxValue) *
                height;

            return `${x},${y}`;
        })
        .join(" ");
}


/* =========================================================
   LINE CHART
========================================================= */

function LineChart({
    values,
    secondaryValues,
    maxValue = 80,
    color = "#2563eb",
    secondaryColor = "#dc2626",
}) {
    const width = 420;
    const height = 160;

    const primaryPoints =
        buildPolylinePoints(
            values,
            width,
            height,
            maxValue
        );

    const primaryAreaPoints = values.length
        ? `0,${height} ${primaryPoints} ${width},${height}`
        : "";

    const secondaryPoints =
        secondaryValues
            ? buildPolylinePoints(
                secondaryValues,
                width,
                height,
                maxValue
            )
            : "";

    const gradId = `chartGrad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
        <div className="history-line-chart">

            <svg
                viewBox={`0 0 ${width + 42} ${height + 35}`}
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* GRID */}
                {[0, 1, 2, 3, 4].map(
                    (line) => {
                        const y =
                            5 +
                            (line *
                                height) /
                            4;

                        return (
                            <line
                                key={line}
                                x1="0"
                                y1={y}
                                x2={width}
                                y2={y}
                                className="chart-grid-line"
                            />
                        );
                    }
                )}

                {/* AREA FILL */}
                {primaryAreaPoints && (
                    <polygon
                        points={primaryAreaPoints}
                        fill={`url(#${gradId})`}
                    />
                )}

                {/* PRIMARY */}
                <polyline
                    points={primaryPoints}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />

                {/* SECONDARY */}
                {secondaryValues && (
                    <polyline
                        points={secondaryPoints}
                        fill="none"
                        stroke={secondaryColor}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}

            </svg>

            <div className="chart-years">
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
                <span>2025</span>
                <span>2026</span>
            </div>

        </div>
    );
}


/* =========================================================
   BAR + LINE CHART
========================================================= */

function BarLineChart({ rainfallData = [], floodLineData = [] }) {

    const width = 420;
    const height = 160;

    const linePoints =
        buildPolylinePoints(
            floodLineData,
            width,
            height,
            80
        );

    return (
        <div className="history-bar-chart">

            <div className="bar-area">

                {rainfallData.map(
                    (value, index) => (

                        <div
                            key={index}
                            className="bar-column"
                            style={{
                                height:
                                    `${Math.min(
                                        100,
                                        (value / 300) *
                                        100
                                    )}%`,
                            }}
                        />
                    )
                )}

            </div>


            <svg
                className="bar-line-svg"
                viewBox={`0 0 ${width + 12} ${height + 10}`}
                preserveAspectRatio="none"
            >

                <polyline
                    points={linePoints}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />

            </svg>


            <div className="chart-years">

                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
                <span>2025</span>
                <span>2026</span>

            </div>

        </div>
    );
}


/* =========================================================
   HISTORICAL ANALYSIS
========================================================= */

function HistoricalAnalysis({
    onNavigate,
}) {

    // API States
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(true);

    const [timePeriod, setTimePeriod] = useState("Last 1 Year");
    const [stateFilter, setStateFilter] = useState("All States");
    const [district, setDistrict] = useState("All Districts");
    const [eventType, setEventType] = useState("Flood Events");
    const [riskLevel, setRiskLevel] = useState("All Risk Levels");
    const [selectedChart, setSelectedChart] = useState("Monthly");

    // Computed Options
    const timeOptions = ["Last 1 Month", "Last 3 Months", "Last 6 Months", "Last 1 Year", "Last 3 Years", "Last 5 Years", "All Time"];
    const allStates = ["All States", ...Object.keys(indiaStatesAndDistricts).sort()];
    const availableDistricts = stateFilter === "All States" ? ["All Districts"] : ["All Districts", ...(indiaStatesAndDistricts[stateFilter] || [])];

    const fetchHistoricalData = async (time = timePeriod, st = stateFilter, dist = district) => {
        setLoading(true);
        try {
            const url = `${API_URL}/historical/analysis?time_period=${encodeURIComponent(time)}&state=${encodeURIComponent(st)}&district=${encodeURIComponent(dist)}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    setApiData(data);
                    setHasData(true);
                } else {
                    // No data for these filters — still render page with static fallback
                    setApiData(null);
                    setHasData(false);
                }
            } else {
                setApiData(null);
                setHasData(false);
            }
        } catch(err) {
            console.error("Historical fetch error:", err);
            setApiData(null);
            setHasData(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistoricalData();
    }, []);

    const handleApplyFilters = () => {
        fetchHistoricalData(timePeriod, stateFilter, district);
    };


    const [eventMapFilter, setEventMapFilter] =
        useState("All Events");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [exporting, setExporting] =
        useState(false);


    /* =======================================================
       FILTERED DATA
    ======================================================= */

    // --- Data Mapping ---
    const totalFloodEvents = apiData?.stats?.total_events || 0;
    const highRiskDays = apiData?.stats?.high_risk_days || 0;
    const avgRainfall = apiData?.stats?.avg_rainfall || 0;
    const maxRainfall = apiData?.stats?.max_rainfall || 0;
    const meanProb = apiData?.stats?.mean_prob || 0;
    
    const filteredEvents = apiData?.top_10 || [];
    const metrics = apiData?.metrics || { accuracy: 81.4, precision: 79.6, recall: 83.2, f1: 81.3 };
    
    const dynamicRiskDist = apiData?.risk_distribution || [];
    const cData = apiData?.chart_data || [];
    const dynamicRainfallChart = cData.length > 0 ? cData.map(d => d.rainfall || 0) : rainfallChart;
    const dynamicRainfallFloodLine = cData.length > 0 ? cData.map(d => d.floods * 10 || 0) : rainfallFloodLine;
    const dynamicFloodEventChart = cData.length > 0 ? cData.map(d => Math.min(80, (d.floods || 0) * 5)) : floodEventChart;
    const dynamicHighRiskChart = cData.length > 0 ? cData.map(d => Math.min(80, (d.risk_days || 0) * 5)) : highRiskChart;
    const dynamicPredictionLine = cData.length > 0 ? cData.map(d => Math.min(100, (d.floods || 0) * 8)) : predictionLine;
    const dynamicActualLine = cData.length > 0 ? cData.map(d => Math.min(100, (d.risk_days || 0) * 8)) : actualLine;


    /* =======================================================
       RESET
    ======================================================= */

    const handleReset = () => {
        setStateFilter("All States");
        setDistrict("All Districts");
        setTimePeriod("Last 1 Year");
        setEventType("Flood Events");
        setRiskLevel("All Risk Levels");
        fetchHistoricalData("Last 1 Year", "All States", "All Districts");
        setCurrentPage(1);
    };


    /* =======================================================
       EXPORT CSV
    ======================================================= */

    const handleExport = () => {

        setExporting(true);

        const headers = [
            "Date & Time",
            "Location",
            "District",
            "Rainfall (24h)",
            "Max Rainfall (1h)",
            "Flood Probability",
            "Risk Level",
            "Actual Event",
            "Impact",
            "Source",
        ];

        const rows =
            filteredEvents.map(
                (event) => [
                    event.date,
                    event.location,
                    event.district,
                    `${event.rainfall24} mm`,
                    `${event.maxRainfall1} mm`,
                    `${event.probability}%`,
                    event.risk,
                    event.actual,
                    event.impact,
                    event.source,
                ]
            );

        const csv = [
            headers.join(","),
            ...rows.map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(
                                    value
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            ),
        ].join("\n");

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "historical-analysis.csv";

        link.click();

        URL.revokeObjectURL(url);

        setTimeout(() => {
            setExporting(false);
        }, 600);

    };


    return (

        <div className="historical-page">


            {/* =====================================================
          SIDEBAR
      ===================================================== */}

            <Sidebar
                activePage="historical"
                onNavigate={onNavigate}
            />


            {/* =====================================================
          MAIN
      ===================================================== */}

            <div className="historical-main">


                {/* ===================================================
            HEADER
        =================================================== */}

                <header className="historical-header">

                    <div className="historical-title">

                        <h1>
                            Historical Analysis
                        </h1>

                        <p>
                            Analyze past flood events, rainfall patterns
                            and model performance over time.
                        </p>

                    </div>


                    <div className="historical-header-actions">

                        <button
                            className="header-date-range"
                            type="button"
                        >

                            <CalendarDays
                                size={14}
                            />

                            <span>
                                24 Aug 2021 - 30 Aug 2026
                            </span>

                            <ChevronDown
                                size={13}
                            />

                        </button>


                        <button
                            className="export-report-button"
                            type="button"
                            onClick={handleExport}
                        >

                            <Download
                                size={14}
                            />

                            {exporting
                                ? "Exporting..."
                                : "Export Report"}

                        </button>


                        <button
                            className="history-notification"
                            type="button"
                        >

                            <Bell
                                size={16}
                            />

                            <span>
                                3
                            </span>

                        </button>


                        <button
                            className="history-profile"
                            type="button"
                            onClick={() =>
                                setMenuOpen(
                                    (value) => !value
                                )
                            }
                        >

                            <div className="history-avatar">
                                <User
                                    size={15}
                                />
                            </div>

                            <div>

                                <strong>
                                    Souvik Konar
                                </strong>

                                <span>
                                    Admin
                                </span>

                            </div>

                            <ChevronDown
                                size={12}
                            />

                        </button>


                        {menuOpen && (

                            <div className="history-profile-menu">

                                <button type="button">
                                    <User size={13} />
                                    My Profile
                                </button>

                                <button type="button">
                                    Settings
                                </button>

                                <button
                                    type="button"
                                    className="logout"
                                    onClick={() => {

                                        localStorage.removeItem(
                                            "isLoggedIn"
                                        );

                                        window.location.href =
                                            "/";

                                    }}
                                >
                                    Logout
                                </button>

                            </div>

                        )}

                    </div>

                </header>


                {/* ===================================================
            FILTER BAR
        =================================================== */}

                <section className="historical-filters">

                    <div className="filter-field">

                        <label>
                            Time Period
                        </label>

                        <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
    {timeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
</select>

                    </div>


                    <div className="filter-field">

                        <label>
                            District
                        </label>

                        <select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setDistrict("All Districts"); }}>
    {allStates.map(state => (<option key={state} value={state}>{state}</option>))}
</select>

                    </div>


                    <div className="filter-field">

                        <label>
                            Location
                        </label>

                        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
    {availableDistricts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
</select>

                    </div>


                    <div className="filter-field">

                        <label>
                            Event Type
                        </label>

                        <select
                            value={eventType}
                            onChange={(e) =>
                                setEventType(
                                    e.target.value
                                )
                            }
                        >

                            <option>
                                All Events
                            </option>

                            <option>
                                Flood Events
                            </option>

                            <option>
                                High Rainfall
                            </option>

                        </select>

                    </div>


                    <div className="filter-field">

                        <label>
                            Risk Level
                        </label>

                        <select
                            value={riskLevel}
                            onChange={(e) =>
                                setRiskLevel(
                                    e.target.value
                                )
                            }
                        >

                            <option>
                                All Levels
                            </option>

                            <option>
                                Low
                            </option>

                            <option>
                                Moderate
                            </option>

                            <option>
                                High
                            </option>

                            <option>
                                Critical
                            </option>

                        </select>

                    </div>


                    <button
                        className="apply-filter-button"
                        type="button"
                        onClick={() => {
                            setCurrentPage(1);
                            handleApplyFilters();
                        }}
                    >

                        <SlidersHorizontal
                            size={13}
                        />

                        Apply Filters

                    </button>


                    <button className="reset-filter-button" type="button" onClick={handleReset}><RotateCcw size={13} /> Reset</button>

                </section>


                {/* ===================================================
            LOADING STATE
        =================================================== */}
        {loading && (
            <div className="loading-state" style={{ padding: "100px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", marginTop: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #f3f4f6", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
                <h3 style={{ fontSize: "18px", color: "#334155" }}>Loading historical analysis...</h3>
            </div>
        )}

        {/* ===================================================
            NO DATA STATE
        =================================================== */}
        {!loading && !hasData && (
            <div style={{ padding: '10px 0 0', marginBottom: '-8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <span style={{ fontSize: '13px', color: '#713f12' }}>No predictions found for these filters. Showing sample data below. <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#0284c7', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', padding: 0 }}>Clear Filters</button></span>
                </div>
            </div>
        )}

        {/* ===================================================
            STATS
        =================================================== */}
        {!loading && (
            <>


                <section className="historical-stat-grid">


                    <div className="historical-stat-card">

                        <div className="stat-icon blue">
                            <Map size={23} />
                        </div>

                        <div>

                            <span>
                                Total Flood Events
                            </span>

                            <strong>
                                {totalFloodEvents}
                            </strong>

                            <small>
                                In selected period
                            </small>

                        </div>

                    </div>


                    <div className="historical-stat-card">

                        <div className="stat-icon red">
                            <AlertTriangle size={23} />
                        </div>

                        <div>

                            <span>
                                High Risk Days
                            </span>

                            <strong>
                                {highRiskDays}
                            </strong>

                            <small>
                                61.6% of total days
                            </small>

                        </div>

                    </div>


                    <div className="historical-stat-card">

                        <div className="stat-icon yellow">
                            <CloudRain size={23} />
                        </div>

                        <div>

                            <span>
                                Total Rainfall (Avg. 24h)
                            </span>

                            <strong>
                                118.6 <small>mm</small>
                            </strong>

                            <small>
                                Average
                            </small>

                        </div>

                    </div>


                    <div className="historical-stat-card">

                        <div className="stat-icon green">
                            <TrendingUp size={23} />
                        </div>

                        <div>

                            <span>
                                Max Rainfall (24h)
                            </span>

                            <strong>
                                286.4 <small>mm</small>
                            </strong>

                            <small>
                                12 Jul 2023
                            </small>

                        </div>

                    </div>


                    <div className="historical-stat-card">

                        <div className="stat-icon purple">
                            <Activity size={23} />
                        </div>

                        <div>

                            <span>
                                Mean Flood Probability
                            </span>

                            <strong>
                                {meanProb}%
                            </strong>

                            <small>
                                Average
                            </small>

                        </div>

                    </div>

                </section>


                {/* ===================================================
            TOP CHART ROW
        =================================================== */}

                <section className="historical-grid-3">


                    {/* FLOOD EVENTS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <div>

                                <h2>
                                    Flood Events Over Time
                                </h2>

                                <div className="chart-legend">

                                    <span>
                                        <i className="dot-blue"></i>
                                        Flood Events
                                    </span>

                                    <span>
                                        <i className="dot-red"></i>
                                        High Risk Days
                                    </span>

                                </div>

                            </div>


                            <select
                                value={selectedChart}
                                onChange={(e) =>
                                    setSelectedChart(
                                        e.target.value
                                    )
                                }
                            >

                                <option>
                                    Monthly
                                </option>

                                <option>
                                    Quarterly
                                </option>

                                <option>
                                    Yearly
                                </option>

                            </select>

                        </div>


                        <LineChart
                            values={dynamicFloodEventChart}
                            secondaryValues={dynamicHighRiskChart}
                            maxValue={80}
                        />

                    </div>


                    {/* RAINFALL VS FLOODS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <div>

                                <h2>
                                    Rainfall vs Flood Events
                                </h2>

                                <div className="chart-legend">

                                    <span>
                                        <i className="dot-blue"></i>
                                        Rainfall (mm)
                                    </span>

                                    <span>
                                        <i className="dot-red"></i>
                                        Flood Events
                                    </span>

                                </div>

                            </div>


                            <select>

                                <option>
                                    Monthly
                                </option>

                                <option>
                                    Quarterly
                                </option>

                            </select>

                        </div>


                        <BarLineChart rainfallData={dynamicRainfallChart} floodLineData={dynamicRainfallFloodLine} />

                    </div>


                    {/* EVENT MAP */}

                    <div className="analysis-card historical-map-analysis-card">

                        <div className="analysis-card-header">

                            <h2>
                                Event Map
                            </h2>

                            <select
                                value={eventMapFilter}
                                onChange={(e) =>
                                    setEventMapFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option>
                                    All Events
                                </option>

                                <option>
                                    High Risk
                                </option>

                                <option>
                                    Critical
                                </option>

                            </select>

                        </div>


                        <div className="historical-map">

                            <div className="historical-map-mountain"></div>


                            {[
                                ["Uttarkashi", 61, 16, "yellow"],
                                ["Dehradun", 31, 29, "red"],
                                ["Tehri", 51, 36, "red"],
                                ["Rudraprayag", 72, 27, "yellow"],
                                ["Pauri", 60, 53, "yellow"],
                                ["Haridwar", 38, 63, "green"],
                                ["Nainital", 73, 68, "green"],
                                ["Chamoli", 83, 45, "orange"],
                                ["Almora", 91, 57, "orange"],
                            ].map(
                                ([name, left, top, risk]) => (

                                    <div
                                        key={name}
                                        className={`historical-event-map-marker ${risk}`}
                                        style={{
                                            left: `${left}%`,
                                            top: `${top}%`,
                                        }}
                                        title={name}
                                    >

                                        <span></span>

                                    </div>

                                )
                            )}

                            <div className="historical-map-label uttarkashi">
                                Uttarkashi
                            </div>

                            <div className="historical-map-label dehradun">
                                Dehradun
                            </div>

                            <div className="historical-map-label tehrilabel">
                                Tehri Garhwal
                            </div>

                            <div className="historical-map-label rudraprayag">
                                Rudraprayag
                            </div>

                            <div className="historical-map-label pauri">
                                Pauri Garhwal
                            </div>

                            <div className="historical-map-label haridwar">
                                Haridwar
                            </div>

                            <div className="historical-map-zoom-controls">

                                <button type="button">
                                    +
                                </button>

                                <button type="button">
                                    −
                                </button>

                                <button type="button">
                                    <LayersIcon />
                                </button>

                            </div>


                            <div className="historical-map-risk-legend">

                                <span>
                                    <i className="low"></i>
                                    Low
                                </span>

                                <span>
                                    <i className="moderate"></i>
                                    Moderate
                                </span>

                                <span>
                                    <i className="high"></i>
                                    High
                                </span>

                                <span>
                                    <i className="critical"></i>
                                    Critical
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ===================================================
            SECOND ROW
        =================================================== */}

                <section className="historical-grid-3">


                    {/* RISK DISTRIBUTION */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h2>
                                Risk Level Distribution
                            </h2>

                        </div>


                        <div className="risk-distribution-body">

                            <div className="risk-donut">

                                <div>

                                    <small>
                                        Total
                                    </small>

                                    <strong>
                                        {totalFloodEvents}
                                    </strong>

                                    <span>
                                        Events
                                    </span>

                                </div>

                            </div>


                            <div className="risk-list">

                                <div>
                                    <i className="risk-green"></i>
                                    <span>
                                        Low (0 - 30%)
                                    </span>
                                    <strong>
                                        48 (24.2%)
                                    </strong>
                                </div>

                                <div>
                                    <i className="risk-yellow"></i>
                                    <span>
                                        Moderate (30 - 60%)
                                    </span>
                                    <strong>
                                        62 (31.3%)
                                    </strong>
                                </div>

                                <div>
                                    <i className="risk-orange"></i>
                                    <span>
                                        High (60 - 80%)
                                    </span>
                                    <strong>
                                        58 (29.3%)
                                    </strong>
                                </div>

                                <div>
                                    <i className="risk-red"></i>
                                    <span>
                                        Critical (80 - 100%)
                                    </span>
                                    <strong>
                                        30 (15.2%)
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* MODEL PERFORMANCE */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h2>
                                Prediction vs Actual (Flood Events)
                            </h2>

                        </div>


                        <div className="performance-metrics">

                            <div>
                                <span>
                                    Accuracy
                                </span>

                                <strong>
                                    81.4%
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Precision
                                </span>

                                <strong>
                                    79.6%
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Recall
                                </span>

                                <strong>
                                    83.2%
                                </strong>
                            </div>

                            <div>
                                <span>
                                    F1 Score
                                </span>

                                <strong>
                                    81.3%
                                </strong>
                            </div>

                        </div>


                        <div className="performance-chart">

                            <div className="performance-legend">

                                <span>
                                    <i className="dot-blue"></i>
                                    Predicted Probability
                                </span>

                                <span>
                                    <i className="dot-red"></i>
                                    Actual (Flood Occurred)
                                </span>

                            </div>


                            <LineChart
                                values={dynamicPredictionLine}
                                secondaryValues={dynamicActualLine}
                                maxValue={100}
                            />

                        </div>

                    </div>


                    {/* TOP RAINFALL EVENTS */}

                    <div className="analysis-card rainfall-events-card">

                        <div className="analysis-card-header">

                            <h2>
                                Top 10 Rainfall Events (24h)
                            </h2>

                        </div>


                        <div className="rainfall-events-table-wrap">

                            <table className="rainfall-events-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Rank
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Rainfall (24h)
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {[
                                        ["1", "12 Jul 2023", "Tehri", "286.4 mm"],
                                        ["2", "17 Jun 2022", "Rudraprayag", "276.1 mm"],
                                        ["3", "23 Aug 2021", "Chamoli", "265.3 mm"],
                                        ["4", "31 Jul 2024", "Pauri Garhwal", "252.8 mm"],
                                        ["5", "05 Sep 2023", "Uttarkashi", "243.6 mm"],
                                        ["6", "15 Aug 2022", "Nainital", "238.9 mm"],
                                        ["7", "29 Jul 2021", "Tehri", "237.4 mm"],
                                        ["8", "03 Jul 2024", "Haridwar", "231.2 mm"],
                                        ["9", "21 Aug 2023", "Chamoli", "228.7 mm"],
                                        ["10", "11 Sep 2022", "Rudraprayag", "224.1 mm"],
                                    ].map(
                                        (row) => (

                                            <tr key={row[0]}>

                                                <td>
                                                    {row[0]}
                                                </td>

                                                <td>
                                                    {row[1]}
                                                </td>

                                                <td>
                                                    {row[2]}
                                                </td>

                                                <td>
                                                    {row[3]}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>


                {/* ===================================================
            HISTORICAL FLOOD EVENTS
        =================================================== */}

                <section className="analysis-card historical-events-card">

                    <div className="analysis-card-header">

                        <h2>
                            Historical Flood Events
                        </h2>

                        <button
                            className="view-events-button"
                            type="button"
                        >
                            View All Events
                        </button>

                    </div>


                    <div className="events-table-wrap">

                        <table className="historical-events-table">

                            <thead>

                                <tr>

                                    <th>
                                        Date &amp; Time
                                    </th>

                                    <th>
                                        Location
                                    </th>

                                    <th>
                                        District
                                    </th>

                                    <th>
                                        Rainfall (24h)
                                    </th>

                                    <th>
                                        Max Rainfall (1h)
                                    </th>

                                    <th>
                                        Flood Probability
                                    </th>

                                    <th>
                                        Risk Level
                                    </th>

                                    <th>
                                        Actual Event
                                    </th>

                                    <th>
                                        Impact
                                    </th>

                                    <th>
                                        Source
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredEvents.map(
                                    (event) => (

                                        <tr
                                            key={
                                                `${event.date}-${event.location}`
                                            }
                                        >

                                            <td>
                                                {event.date}
                                            </td>

                                            <td>
                                                {event.location}
                                            </td>

                                            <td>
                                                {event.district}
                                            </td>

                                            <td>
                                                {event.rainfall24} mm
                                            </td>

                                            <td>
                                                {event.maxRainfall1} mm
                                            </td>

                                            <td className="probability">
                                                {event.probability}%
                                            </td>

                                            <td>

                                                <span
                                                    className={`risk-badge ${event.risk.toLowerCase()}`}
                                                >
                                                    {event.risk}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        event.actual ===
                                                            "Yes"
                                                            ? "actual-yes"
                                                            : "actual-no"
                                                    }
                                                >
                                                    {event.actual}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`impact-${event.impact
                                                        .toLowerCase()
                                                        .replace(
                                                            " ",
                                                            "-"
                                                        )}`}
                                                >
                                                    {event.impact}
                                                </span>

                                            </td>

                                            <td>
                                                {event.source}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="table-view-button"
                                                    title="View event"
                                                >
                                                    <Eye size={13} />
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* PAGINATION */}

                    <div className="events-pagination">

                        <span>
                            Showing 1 to{" "}
                            {filteredEvents.length}{" "}
                            of {totalFloodEvents} events
                        </span>


                        <div className="pagination-buttons">

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.max(
                                            1,
                                            currentPage - 1
                                        )
                                    )
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>


                            {[1, 2, 3].map(
                                (page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            currentPage ===
                                                page
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                    >
                                        {page}
                                    </button>

                                )
                            )}


                            <span className="pagination-dots">
                                ...
                            </span>


                            <button
                                type="button"
                            >
                                40
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage(
                                        currentPage + 1
                                    )
                                }
                            >
                                <ChevronRight
                                    size={14}
                                />
                            </button>

                        </div>


                        <div className="rows-per-page">

                            <span>
                                Rows per page:
                            </span>

                            <select>

                                <option>
                                    10
                                </option>

                                <option>
                                    20
                                </option>

                                <option>
                                    50
                                </option>

                            </select>

                            <ChevronDown
                                size={12}
                            />

                        </div>

                    </div>

                </section>
            </>
        )}

            </div>

        </div>
    );
}


/* =========================================================
   SMALL MAP ICON
========================================================= */

function LayersIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
            <path d="m3 12 9 5 9-5" />
            <path d="m3 17 9 5 9-5" />
        </svg>
    );
}


export default HistoricalAnalysis;