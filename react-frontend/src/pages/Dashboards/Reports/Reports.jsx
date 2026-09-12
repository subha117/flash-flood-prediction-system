import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  History,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import "./Reports.css";

const REPORTS_DATA = [
  {
    id: "RPT-2026-0042",
    name: "Weekly Flash Flood Risk Report",
    type: "Risk Summary",
    location: "Selected Region",
    period: "24 Aug - 30 Aug 2026",
    created: "30 Aug 2026, 06:40 PM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "2.4 MB",
    description:
      "Weekly overview of rainfall, flood probability, alerts, and district-wise risk conditions.",
  },
  {
    id: "RPT-2026-0041",
    name: "Selected Location District Alert Analysis",
    type: "Alert Analysis",
    location: "Selected District",
    period: "01 Aug - 30 Aug 2026",
    created: "30 Aug 2026, 02:15 PM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "1.8 MB",
    description:
      "Detailed alert history with active warnings, response status, and probability trends.",
  },
  {
    id: "RPT-2026-0040",
    name: "Monthly Weather & Rainfall Report",
    type: "Weather Report",
    location: "Selected Region",
    period: "01 Aug - 30 Aug 2026",
    created: "29 Aug 2026, 08:20 PM",
    format: "CSV",
    status: "Ready",
    owner: "Souvik Konar",
    size: "640 KB",
    description:
      "Rainfall totals, averages, peak intensity, and weather observations for the selected period.",
  },
  {
    id: "RPT-2026-0039",
    name: "Historical Flood Event Review",
    type: "Historical Analysis",
    location: "Selected Region",
    period: "2021 - 2026",
    created: "28 Aug 2026, 05:45 PM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "3.1 MB",
    description:
      "Historical flood events, high-risk days, rainfall patterns, and model performance summary.",
  },
  {
    id: "RPT-2026-0038",
    name: "Model Performance Report",
    type: "Model Performance",
    location: "Selected Region",
    period: "01 Jul - 31 Jul 2026",
    created: "01 Aug 2026, 09:10 AM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "1.5 MB",
    description:
      "Prediction accuracy, false positives, false negatives, and district-wise performance metrics.",
  },
  {
    id: "RPT-2026-0037",
    name: "Emergency Alert Log",
    type: "Alert Log",
    location: "Selected Region",
    period: "01 Jul - 31 Jul 2026",
    created: "01 Aug 2026, 08:30 AM",
    format: "CSV",
    status: "Ready",
    owner: "Souvik Konar",
    size: "420 KB",
    description:
      "Chronological record of warning events, severity, affected districts, and validity windows.",
  },
  {
    id: "RPT-2026-0036",
    name: "District Risk Comparison",
    type: "Risk Summary",
    location: "Chamoli",
    period: "15 Jul - 15 Aug 2026",
    created: "16 Aug 2026, 03:05 PM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "1.9 MB",
    description:
      "Comparison of flood probability, rainfall intensity, and alert frequency across selected districts.",
  },
  {
    id: "RPT-2026-0035",
    name: "Monsoon Readiness Review",
    type: "Operational",
    location: "Selected Region",
    period: "01 Jun - 31 Jul 2026",
    created: "02 Aug 2026, 11:40 AM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "2.2 MB",
    description:
      "Operational readiness snapshot covering alerts, monitoring coverage, and recent flood-risk patterns.",
  },
  {
    id: "RPT-2026-0034",
    name: "Sensor Data Coverage Report",
    type: "Data Coverage",
    location: "Selected Region",
    period: "01 Jul - 31 Jul 2026",
    created: "01 Aug 2026, 10:15 AM",
    format: "CSV",
    status: "Ready",
    owner: "Souvik Konar",
    size: "510 KB",
    description:
      "Availability and completeness snapshot for rainfall, river-level, weather, and monitoring data sources.",
  },
  {
    id: "RPT-2026-0033",
    name: "Critical Event Incident Report",
    type: "Incident Report",
    location: "Rudraprayag",
    period: "28 Jul - 31 Jul 2026",
    created: "31 Jul 2026, 11:30 PM",
    format: "PDF",
    status: "Ready",
    owner: "Souvik Konar",
    size: "1.1 MB",
    description:
      "Incident-level review of critical alerts, rainfall spikes, and response timelines.",
  },
];

const REPORT_TYPES = [
  "All Report Types",
  "Risk Summary",
  "Alert Analysis",
  "Weather Report",
  "Historical Analysis",
  "Model Performance",
  "Alert Log",
  "Operational",
  "Data Coverage",
  "Incident Report",
];

const LOCATIONS = [
  "All Locations",
  "Selected Region",
  "Selected District",
  "Chamoli",
  "Rudraprayag",
];

function formatClass(format) {
  return format.toLowerCase();
}

function Reports({ onNavigate }) {
  const [reports, setReports] = useState(REPORTS_DATA);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Report Types");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Newest First");
  const [dateRange, setDateRange] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState("");
  const [generatorType, setGeneratorType] = useState("Risk Summary");
  const [generatorLocation, setGeneratorLocation] = useState("Selected Region");
  const [generatorPeriod, setGeneratorPeriod] = useState("Last 7 Days");
  const [generatorFormat, setGeneratorFormat] = useState("PDF");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = reports.filter((report) => {
      const matchQuery =
        !query ||
        report.id.toLowerCase().includes(query) ||
        report.name.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query);

      const matchType = type === "All Report Types" || report.type === type;
      const matchLocation =
        location === "All Locations" || report.location === location;
      const matchStatus =
        statusFilter === "All Statuses" || report.status === statusFilter;
      const matchFormat =
        formatFilter === "All Formats" || report.format === formatFilter;
      const matchDateRange =
        dateRange === "All Time" ||
        (dateRange === "Last 7 Days" && report.id >= "RPT-2026-0039") ||
        (dateRange === "Last 30 Days" && report.id >= "RPT-2026-0037") ||
        (dateRange === "Last 90 Days" && report.id >= "RPT-2026-0034");

      return matchQuery && matchType && matchLocation && matchStatus && matchFormat && matchDateRange;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "Name A-Z") return a.name.localeCompare(b.name);
      if (sortBy === "Name Z-A") return b.name.localeCompare(a.name);
      if (sortBy === "Oldest First") return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id);
    });
  }, [reports, search, type, location, sortBy, dateRange, statusFilter, formatFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const visibleReports = filteredReports.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const readyCount = reports.filter((report) => report.status === "Ready").length;
  const pdfCount = reports.filter((report) => report.format === "PDF").length;
  const csvCount = reports.filter((report) => report.format === "CSV").length;

  const clearFilters = () => {
    setSearch("");
    setType("All Report Types");
    setLocation("All Locations");
    setSortBy("Newest First");
    setDateRange("All Time");
    setStatusFilter("All Statuses");
    setFormatFilter("All Formats");
    setPage(1);
  };

  const downloadCSV = (report) => {
    const rows = [
      ["Report ID", report.id],
      ["Report Name", report.name],
      ["Type", report.type],
      ["Location", report.location],
      ["Period", report.period],
      ["Created", report.created],
      ["Format", report.format],
      ["Status", report.status],
      ["Owner", report.owner],
      ["Size", report.size],
      ["Description", report.description],
    ];

    const csv = rows
      .map(([key, value]) =>
        [key, value]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCurrent = () => {
    const rows = [
      [
        "Report ID",
        "Report Name",
        "Type",
        "Location",
        "Period",
        "Created",
        "Format",
        "Status",
      ],
      ...filteredReports.map((report) => [
        report.id,
        report.name,
        report.type,
        report.location,
        report.period,
        report.created,
        report.format,
        report.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashflood-reports.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGeneratedNotice("");

    setTimeout(() => {
      const nextNumber = String(
        Math.max(...reports.map((report) => Number(report.id.split("-").pop()))) + 1
      ).padStart(4, "0");
      const newReport = {
        id: `RPT-2026-${nextNumber}`,
        name: `${generatorType} Report`,
        type: generatorType,
        location: generatorLocation,
        period: generatorPeriod,
        created: "Just now",
        format: generatorFormat,
        status: "Ready",
        owner: "Souvik Konar",
        size: generatorFormat === "PDF" ? "1.2 MB" : "320 KB",
        description: `Generated ${generatorType.toLowerCase()} for ${generatorLocation} covering ${generatorPeriod.toLowerCase()}.`,
      };
      setReports((current) => [newReport, ...current]);
      setGenerating(false);
      setShowGenerator(false);
      setPage(1);
      setGeneratedNotice(
        `${newReport.name} created for ${generatorLocation} (${generatorFormat}).`
      );
      setTimeout(() => setGeneratedNotice(""), 4000);
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  return (
    <div className="reports-page">
      <Sidebar activePage="reports" onNavigate={onNavigate} />

      <main className="reports-main">
        <Navbar 
        title="Reports" 
        subtitle="Generate, review and export flash flood monitoring reports."
    >
        <div style={{ display: 'flex', gap: '12px', marginRight: '16px' }}>

            <button className="header-action-btn" type="button" onClick={handleExportCurrent} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer' }}>
              <Download size={15} />
              Export Data
            </button>
            <button className="header-action-btn primary" type="button" onClick={() => setShowGenerator(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0ea5e9', border: 'none', borderRadius: '8px', fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>
              <Plus size={15} />
              Generate Report
            </button>
    
        </div>
    </Navbar>

        <section className="reports-content">
          {generatedNotice && (
            <div className="generated-notice">
              <CheckCircle2 size={17} />
              {generatedNotice}
            </div>
          )}

          <section className="report-summary-grid">
            <div className="report-summary-card blue">
              <div className="summary-icon"><FileText size={19} /></div>
              <div>
                <span>Total Reports</span>
                <strong>{reports.length}</strong>
                <small>Generated reports</small>
              </div>
            </div>
            <div className="report-summary-card green">
              <div className="summary-icon"><CheckCircle2 size={19} /></div>
              <div>
                <span>Ready to View</span>
                <strong>{readyCount}</strong>
                <small>Available now</small>
              </div>
            </div>
            <div className="report-summary-card purple">
              <div className="summary-icon"><FileSpreadsheet size={19} /></div>
              <div>
                <span>CSV Reports</span>
                <strong>{csvCount}</strong>
                <small>Data exports</small>
              </div>
            </div>
            <div className="report-summary-card orange">
              <div className="summary-icon"><FileBarChart2 size={19} /></div>
              <div>
                <span>PDF Reports</span>
                <strong>{pdfCount}</strong>
                <small>Presentation ready</small>
              </div>
            </div>
          </section>

          <section className="report-quick-grid">
            <button type="button" className="quick-report-card" onClick={() => { setGeneratorType("Risk Summary"); setShowGenerator(true); }}>
              <div className="quick-icon blue"><BarChart3 size={20} /></div>
              <div>
                <strong>Risk Summary</strong>
                <span>District-wise flood risk and probability</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button type="button" className="quick-report-card" onClick={() => { setGeneratorType("Alert Analysis"); setShowGenerator(true); }}>
              <div className="quick-icon red"><Bell size={20} /></div>
              <div>
                <strong>Alert Analysis</strong>
                <span>Warnings, severity and active incidents</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button type="button" className="quick-report-card" onClick={() => { setGeneratorType("Historical Analysis"); setShowGenerator(true); }}>
              <div className="quick-icon purple"><History size={20} /></div>
              <div>
                <strong>Historical Analysis</strong>
                <span>Past events and rainfall trends</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button type="button" className="quick-report-card" onClick={() => { setGeneratorType("Model Performance"); setShowGenerator(true); }}>
              <div className="quick-icon green"><TrendingUp size={20} /></div>
              <div>
                <strong>Model Performance</strong>
                <span>Accuracy and prediction quality</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </section>

          <section className="reports-panel">
            <div className="reports-panel-heading">
              <div>
                <h2>Report Library</h2>
                <p>Search existing reports or refine the list using filters.</p>
              </div>
              <div className="panel-heading-actions">
                <button type="button" className="outline-action" onClick={handlePrint}>
                  <Printer size={14} /> Print
                </button>
                <button type="button" className={`outline-action ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((v) => !v)}>
                  <Filter size={14} /> Filters
                </button>
                <button type="button" className="outline-action" onClick={clearFilters}>
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>

            <div className="reports-toolbar">
              <div className="report-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by report name, ID or location..."
                />
              </div>

              <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                {REPORT_TYPES.map((item) => <option key={item}>{item}</option>)}
              </select>

              <select value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
                {LOCATIONS.map((item) => <option key={item}>{item}</option>)}
              </select>

              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
              </select>
            </div>

            {showFilters && (
              <div className="advanced-report-filters">
                <div>
                  <span>Date Range</span>
                  <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1); }}>
                    <option>All Time</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div>
                  <span>Status</span>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option>All Statuses</option>
                    <option>Ready</option>
                    <option>Processing</option>
                  </select>
                </div>
                <div>
                  <span>Format</span>
                  <select value={formatFilter} onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}>
                    <option>All Formats</option>
                    <option>PDF</option>
                    <option>CSV</option>
                  </select>
                </div>
                <button type="button" onClick={() => setShowFilters(false)}>Done</button>
              </div>
            )}

            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Period</th>
                    <th>Created</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="report-empty">
                        <FolderOpen size={28} />
                        <strong>No reports found</strong>
                        <span>Try changing the search text or filters.</span>
                      </td>
                    </tr>
                  ) : (
                    visibleReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div className="report-name-cell">
                            <div className={`report-file-icon ${formatClass(report.format)}`}>
                              {report.format === "CSV" ? <FileSpreadsheet size={17} /> : <FileText size={17} />}
                            </div>
                            <div>
                              <strong>{report.name}</strong>
                              <span>{report.id}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="report-type-pill">{report.type}</span></td>
                        <td>{report.location}</td>
                        <td>{report.period}</td>
                        <td>{report.created}</td>
                        <td><span className={`format-pill ${formatClass(report.format)}`}>{report.format}</span></td>
                        <td>
                          <span className="report-status"><i></i>{report.status}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button type="button" title="View report" onClick={() => setSelectedReport(report)}><Eye size={15} /></button>
                            <button type="button" title="Download CSV" onClick={() => downloadCSV(report)}><Download size={15} /></button>
                            <button type="button" title="More actions"><MoreVertical size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="reports-pagination">
              <span>
                Showing {filteredReports.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1}
                -{Math.min(safePage * rowsPerPage, filteredReports.length)} of {filteredReports.length} reports
              </span>

              <div className="page-buttons">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((number) => (
                  <button key={number} type="button" className={safePage === number ? "active" : ""} onClick={() => setPage(number)}>
                    {number}
                  </button>
                ))}
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={14} />
                </button>
              </div>

              <label className="rows-select">
                Rows
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                </select>
              </label>
            </div>
          </section>

          <section className="reports-insight-grid">
            <div className="insight-card">
              <div className="insight-icon"><ShieldCheck size={18} /></div>
              <div>
                <strong>Reports are ready for review</strong>
                <p>All generated reports in this prototype are stored locally and can be replaced with API data later.</p>
              </div>
            </div>
            <div className="insight-card blue-border">
              <div className="insight-icon"><Clock3 size={18} /></div>
              <div>
                <strong>Last report generated</strong>
                <p>Weekly Flash Flood Risk Report · 30 Aug 2026, 06:40 PM</p>
              </div>
            </div>
            <div className="insight-card purple-border">
              <div className="insight-icon"><CalendarDays size={18} /></div>
              <div>
                <strong>Next recommended report</strong>
                <p>Generate a weekly risk summary after the next 7-day monitoring window.</p>
              </div>
            </div>
          </section>
        </section>
      </main>

      {selectedReport && (
        <div className="report-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedReport(null); }}>
          <div className="report-modal">
            <div className="report-modal-header">
              <div>
                <span className={`format-pill large ${formatClass(selectedReport.format)}`}>{selectedReport.format}</span>
                <h3>{selectedReport.name}</h3>
                <p>{selectedReport.id} · {selectedReport.created}</p>
              </div>
              <button type="button" onClick={() => setSelectedReport(null)}><X size={17} /></button>
            </div>

            <div className="report-preview-banner">
              <div className="preview-icon"><FileBarChart2 size={28} /></div>
              <div>
                <strong>Report Preview</strong>
                <span>This is the frontend preview shell. Backend report content can be connected later.</span>
              </div>
            </div>

            <div className="report-detail-grid">
              <div><span>Type</span><strong>{selectedReport.type}</strong></div>
              <div><span>Location</span><strong>{selectedReport.location}</strong></div>
              <div><span>Period</span><strong>{selectedReport.period}</strong></div>
              <div><span>Owner</span><strong>{selectedReport.owner}</strong></div>
              <div><span>Status</span><strong>{selectedReport.status}</strong></div>
              <div><span>File Size</span><strong>{selectedReport.size}</strong></div>
            </div>

            <div className="report-description">
              <h4>Description</h4>
              <p>{selectedReport.description}</p>
            </div>

            <div className="report-modal-actions">
              <button type="button" className="secondary-modal-btn" onClick={handlePrint}><Printer size={15} /> Print</button>
              <button type="button" className="secondary-modal-btn" onClick={() => downloadCSV(selectedReport)}><Download size={15} /> Download Data</button>
              <button type="button" className="primary-modal-btn" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showGenerator && (
        <div className="report-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !generating) setShowGenerator(false); }}>
          <div className="generator-modal">
            <div className="generator-header">
              <div>
                <span>REPORT BUILDER</span>
                <h3>Generate a New Report</h3>
                <p>Choose the report scope and format for this prototype.</p>
              </div>
              <button type="button" disabled={generating} onClick={() => setShowGenerator(false)}><X size={17} /></button>
            </div>

            <div className="generator-grid">
              <label>
                <span>Report Type</span>
                <select value={generatorType} onChange={(e) => setGeneratorType(e.target.value)}>
                  {REPORT_TYPES.filter((item) => item !== "All Report Types").map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Location</span>
                <select value={generatorLocation} onChange={(e) => setGeneratorLocation(e.target.value)}>
                  {LOCATIONS.filter((item) => item !== "All Locations").map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Period</span>
                <select value={generatorPeriod} onChange={(e) => setGeneratorPeriod(e.target.value)}>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Custom Range</option>
                </select>
              </label>
              <label>
                <span>Format</span>
                <select value={generatorFormat} onChange={(e) => setGeneratorFormat(e.target.value)}>
                  <option>PDF</option>
                  <option>CSV</option>
                </select>
              </label>
            </div>

            <div className="generator-checklist">
              <div><CheckCircle2 size={15} /> Risk summary</div>
              <div><CheckCircle2 size={15} /> Rainfall & weather</div>
              <div><CheckCircle2 size={15} /> Alert activity</div>
              <div><CheckCircle2 size={15} /> District breakdown</div>
            </div>

            <div className="generator-footer">
              <button type="button" className="secondary-modal-btn" disabled={generating} onClick={() => setShowGenerator(false)}>Cancel</button>
              <button type="button" className="primary-modal-btn" disabled={generating} onClick={handleGenerate}>
                {generating ? <><RefreshCw size={15} className="spin" /> Generating...</> : <><Plus size={15} /> Generate Report</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
