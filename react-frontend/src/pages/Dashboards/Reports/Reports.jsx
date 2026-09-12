import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Eye,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  History,
  Layers,
  MapPin,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  Waves,
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import { AuthContext } from "../../../context/AuthContext";
import { LocationContext } from "../../../context/LocationContext";
import {
  BASELINE_REPORTS,
  downloadSingleReportCSV,
  exportReportsDatasetCSV,
  fetchAllAvailableReports,
  generateNewReport,
  printIndividualReport,
} from "../../../services/reportService";
import "./Reports.css";

function formatClass(format) {
  return (format || "pdf").toLowerCase();
}

function riskBadgeClass(risk) {
  const r = (risk || "").toUpperCase();
  if (r === "CRITICAL") return "risk-critical";
  if (r === "HIGH") return "risk-high";
  if (r === "MODERATE" || r === "MEDIUM") return "risk-moderate";
  return "risk-low";
}

function Reports({ onNavigate }) {
  const { user, logout } = useContext(AuthContext) || {};
  const { location: currentLocation } = useContext(LocationContext) || {};

  // Reports data state
  const [reports, setReports] = useState(BASELINE_REPORTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filters & Sorting
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Report Types");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Newest First");
  const [dateRange, setDateRange] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [formatFilter, setFormatFilter] = useState("All Formats");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Modals and Menus
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);

  // Generator State
  const [generating, setGenerating] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState("");
  const [generatorType, setGeneratorType] = useState("Risk Summary");
  const [generatorLocation, setGeneratorLocation] = useState("Selected Region");
  const [generatorPeriod, setGeneratorPeriod] = useState("Last 7 Days");
  const [generatorFormat, setGeneratorFormat] = useState("PDF");

  // Load all available reports from backend DB and local catalog
  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllAvailableReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Unable to connect to live reports database. Displaying local records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Update default generator location if user has a selected location
  useEffect(() => {
    if (currentLocation?.name && generatorLocation === "Selected Region") {
      setGeneratorLocation(currentLocation.name);
    }
  }, [currentLocation, generatorLocation]);

  // Dynamically extract unique Types and Locations from the actual loaded dataset
  const availableTypes = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (r.type) set.add(r.type);
    });
    return ["All Report Types", ...Array.from(set).sort()];
  }, [reports]);

  const availableLocations = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (r.location) set.add(r.location);
    });
    return ["All Locations", ...Array.from(set).sort()];
  }, [reports]);

  // Filtering and Searching
  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = reports.filter((report) => {
      // 1. Search Query across Name, ID, Location, Type, Description
      const matchQuery =
        !query ||
        report.id?.toLowerCase().includes(query) ||
        report.name?.toLowerCase().includes(query) ||
        report.type?.toLowerCase().includes(query) ||
        report.location?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query);

      // 2. Primary Filters
      const matchType = type === "All Report Types" || report.type === type;
      const matchLocation =
        location === "All Locations" || report.location === location;
      const matchStatus =
        statusFilter === "All Statuses" || report.status === statusFilter;
      const matchFormat =
        formatFilter === "All Formats" || report.format === formatFilter;

      // 3. Date Range Filter
      let matchDateRange = true;
      if (dateRange !== "All Time") {
        const createdText = report.created || "";
        const isRecent =
          createdText.includes("Just now") ||
          createdText.includes("30 Aug 2026") ||
          createdText.includes("11 Sep 2026") ||
          createdText.includes("12 Sep 2026");

        if (dateRange === "Last 24 Hours") {
          matchDateRange =
            createdText.includes("Just now") || createdText.includes("12 Sep 2026");
        } else if (dateRange === "Last 7 Days") {
          matchDateRange =
            isRecent || report.id >= "RPT-2026-0039" || report.id.startsWith("RPT-PRED");
        } else if (dateRange === "Last 30 Days") {
          matchDateRange =
            isRecent || report.id >= "RPT-2026-0035" || report.id.startsWith("RPT-");
        } else if (dateRange === "Last 90 Days") {
          matchDateRange = true;
        }
      }

      return (
        matchQuery &&
        matchType &&
        matchLocation &&
        matchStatus &&
        matchFormat &&
        matchDateRange
      );
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "Name A-Z") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "Name Z-A") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "Oldest First") return (a.id || "").localeCompare(b.id || "");
      if (sortBy === "Risk Level (High to Low)") {
        const order = { CRITICAL: 4, HIGH: 3, MODERATE: 2, MEDIUM: 2, LOW: 1 };
        const riskA = order[a.details?.risk_level?.toUpperCase()] || 0;
        const riskB = order[b.details?.risk_level?.toUpperCase()] || 0;
        return riskB - riskA;
      }
      // Default: Newest First
      if (a.created?.includes("Just now")) return -1;
      if (b.created?.includes("Just now")) return 1;
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [
    reports,
    search,
    type,
    location,
    sortBy,
    dateRange,
    statusFilter,
    formatFilter,
  ]);

  // Pagination Math
  const rowsLimit = rowsPerPage === "All" ? filteredReports.length || 1 : rowsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsLimit));
  const safePage = Math.min(page, totalPages);
  const visibleReports =
    rowsPerPage === "All"
      ? filteredReports
      : filteredReports.slice((safePage - 1) * rowsLimit, safePage * rowsLimit);

  // Dynamic Summary Counters
  const readyCount = reports.filter((r) => r.status === "Ready").length;
  const pdfCount = reports.filter((r) => r.format === "PDF").length;
  const csvCount = reports.filter((r) => r.format === "CSV").length;

  // Reset Functionality
  const clearFilters = () => {
    setSearch("");
    setType("All Report Types");
    setLocation("All Locations");
    setSortBy("Newest First");
    setDateRange("All Time");
    setStatusFilter("All Statuses");
    setFormatFilter("All Formats");
    setPage(1);
    setActionMenuId(null);
  };

  // Quick Filter Card Handler
  const handleQuickFilter = (selectedType) => {
    if (type === selectedType) {
      setGeneratorType(selectedType);
      setShowGenerator(true);
    } else {
      setType(selectedType);
      setPage(1);
    }
  };

  // Bulk Export Data
  const handleExportData = () => {
    exportReportsDatasetCSV(filteredReports);
  };

  // Generate Report Handler
  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedNotice("");
    try {
      const newReport = await generateNewReport({
        type: generatorType,
        location: generatorLocation,
        period: generatorPeriod,
        format: generatorFormat,
        user: user,
      });

      setReports((current) => [newReport, ...current]);
      setShowGenerator(false);
      setPage(1);
      setGeneratedNotice(
        `✓ ${newReport.name} successfully created for ${newReport.location} (${newReport.format}).`
      );
      setTimeout(() => setGeneratedNotice(""), 6000);
    } catch (err) {
      console.error("Error generating report:", err);
      setGeneratedNotice("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Print Handlers
  const handlePrintTable = () => {
    window.print();
  };

  const handlePrintSelected = (rep) => {
    printIndividualReport(rep);
  };

  const handleDownload = (rep) => {
    if (rep.format === "CSV") {
      downloadSingleReportCSV(rep);
    } else {
      printIndividualReport(rep);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }
  };

  const displayName = user?.name || "Souvik Konar";
  const displayRole = user?.role || "Admin";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="reports-page">
      <Sidebar activePage="reports" onNavigate={onNavigate} />

      <main className="reports-main">
        {/* Header */}
        <header className="reports-header">
          <div className="reports-title-wrap">
            <div className="reports-title-icon">
              <FileBarChart2 size={22} />
            </div>
            <div className="reports-title">
              <h1>Reports</h1>
              <p>Generate, review and export flash flood monitoring reports.</p>
            </div>
          </div>

          <div className="reports-header-actions">
            <button
              className="header-action-btn"
              type="button"
              onClick={handleExportData}
              title="Export all currently filtered reports as CSV"
            >
              <Download size={15} />
              Export Data
            </button>

            <button
              className="header-action-btn primary"
              type="button"
              onClick={() => setShowGenerator(true)}
              title="Generate a new custom report"
            >
              <Plus size={15} />
              Generate Report
            </button>

            {/* Notification Bell */}
            <div className="report-header-relative">
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setProfileOpen(false);
                }}
                title="View notifications"
              >
                <Bell size={18} />
                <span>{readyCount > 0 ? Math.min(readyCount, 9) : 0}</span>
              </button>
              {notificationsOpen && (
                <div className="reports-dropdown notification-dropdown">
                  <strong>Reports Notifications</strong>
                  <p>{readyCount} reports are available for instant review & export.</p>
                  <p>Latest database telemetry synced successfully.</p>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="report-header-relative">
              <button
                type="button"
                className="report-profile-btn"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
              >
                <div className="report-avatar">{userInitials || "SK"}</div>
                <div className="report-profile-copy">
                  <strong>{displayName}</strong>
                  <span>{displayRole}</span>
                </div>
                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <div className="reports-dropdown profile-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      if (onNavigate) onNavigate("settings");
                    }}
                  >
                    <User size={14} /> My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      if (onNavigate) onNavigate("settings");
                    }}
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <button
                    type="button"
                    className="logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <section className="reports-content">
          {generatedNotice && (
            <div className="generated-notice">
              <CheckCircle2 size={18} />
              <span>{generatedNotice}</span>
            </div>
          )}

          {error && (
            <div className="reports-error-banner">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button type="button" onClick={loadReports}>
                <RefreshCw size={13} /> Retry Sync
              </button>
            </div>
          )}

          {/* Dynamic Summary Cards */}
          <section className="report-summary-grid">
            <div className="report-summary-card blue">
              <div className="summary-icon">
                <FileText size={20} />
              </div>
              <div>
                <span>Total Reports</span>
                <strong>{loading ? "..." : reports.length}</strong>
                <small>Generated & database records</small>
              </div>
            </div>

            <div className="report-summary-card green">
              <div className="summary-icon">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span>Ready to View</span>
                <strong>{loading ? "..." : readyCount}</strong>
                <small>Available now</small>
              </div>
            </div>

            <div className="report-summary-card purple">
              <div className="summary-icon">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <span>CSV Reports</span>
                <strong>{loading ? "..." : csvCount}</strong>
                <small>Data exports</small>
              </div>
            </div>

            <div className="report-summary-card orange">
              <div className="summary-icon">
                <FileBarChart2 size={20} />
              </div>
              <div>
                <span>PDF Reports</span>
                <strong>{loading ? "..." : pdfCount}</strong>
                <small>Presentation ready</small>
              </div>
            </div>
          </section>

          {/* Quick Categories Navigation */}
          <section className="report-quick-grid">
            <button
              type="button"
              className={`quick-report-card ${type === "Risk Summary" ? "selected" : ""}`}
              onClick={() => handleQuickFilter("Risk Summary")}
              title="Filter by Risk Summary"
            >
              <div className="quick-icon blue">
                <BarChart3 size={20} />
              </div>
              <div>
                <strong>Risk Summary</strong>
                <span>District-wise flood risk and probability</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={`quick-report-card ${type === "Alert Analysis" ? "selected" : ""}`}
              onClick={() => handleQuickFilter("Alert Analysis")}
              title="Filter by Alert Analysis"
            >
              <div className="quick-icon red">
                <Bell size={20} />
              </div>
              <div>
                <strong>Alert Analysis</strong>
                <span>Warnings, severity and active incidents</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={`quick-report-card ${type === "Historical Analysis" ? "selected" : ""}`}
              onClick={() => handleQuickFilter("Historical Analysis")}
              title="Filter by Historical Analysis"
            >
              <div className="quick-icon purple">
                <History size={20} />
              </div>
              <div>
                <strong>Historical Analysis</strong>
                <span>Past events and rainfall trends</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={`quick-report-card ${type === "Model Performance" ? "selected" : ""}`}
              onClick={() => handleQuickFilter("Model Performance")}
              title="Filter by Model Performance"
            >
              <div className="quick-icon green">
                <TrendingUp size={20} />
              </div>
              <div>
                <strong>Model Performance</strong>
                <span>Accuracy and prediction quality</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </section>

          {/* Report Library Panel */}
          <section className="reports-panel">
            <div className="reports-panel-heading">
              <div>
                <h2>Report Library</h2>
                <p>
                  Search existing reports or refine the list using filters (
                  {filteredReports.length} of {reports.length} reports shown).
                </p>
              </div>
              <div className="panel-heading-actions">
                <button
                  type="button"
                  className="outline-action"
                  onClick={handlePrintTable}
                  title="Print visible reports table"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  type="button"
                  className={`outline-action ${showFilters ? "active" : ""}`}
                  onClick={() => setShowFilters((v) => !v)}
                  title="Toggle advanced filters"
                >
                  <Filter size={14} /> Filters
                </button>
                <button
                  type="button"
                  className="outline-action"
                  onClick={clearFilters}
                  title="Reset all search, filters and sorting"
                >
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>

            {/* Toolbar: Search, Filters, Sorting */}
            <div className="reports-toolbar">
              <div className="report-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by report name, ID or location..."
                />
                {search && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dynamic Type Filter */}
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by report type"
              >
                {availableTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {/* Dynamic Location Filter */}
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by location"
              >
                {availableLocations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {/* Sorting Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                aria-label="Sort reports"
              >
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
                <option>Risk Level (High to Low)</option>
              </select>
            </div>

            {/* Advanced Filters Expandable Bar */}
            {showFilters && (
              <div className="advanced-report-filters">
                <div>
                  <span>Date Range</span>
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option>All Time</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div>
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option>All Statuses</option>
                    <option>Ready</option>
                    <option>Processing</option>
                  </select>
                </div>
                <div>
                  <span>Format</span>
                  <select
                    value={formatFilter}
                    onChange={(e) => {
                      setFormatFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option>All Formats</option>
                    <option>PDF</option>
                    <option>CSV</option>
                  </select>
                </div>
                <button type="button" onClick={() => setShowFilters(false)}>
                  Done
                </button>
              </div>
            )}

            {/* Main Reports Table */}
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
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="report-loading-cell">
                        <RefreshCw size={24} className="spin" />
                        <span>Loading reports from database & sensor telemetry...</span>
                      </td>
                    </tr>
                  ) : visibleReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="report-empty">
                        <FolderOpen size={32} />
                        <strong>No reports found</strong>
                        <span>
                          No reports match your current search criteria or active filters.
                        </span>
                        <button
                          type="button"
                          className="secondary-modal-btn mt-2"
                          onClick={clearFilters}
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    visibleReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div className="report-name-cell">
                            <div
                              className={`report-file-icon ${formatClass(
                                report.format
                              )}`}
                            >
                              {report.format === "CSV" ? (
                                <FileSpreadsheet size={18} />
                              ) : (
                                <FileText size={18} />
                              )}
                            </div>
                            <div>
                              <strong>{report.name}</strong>
                              <span>{report.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="report-type-pill">{report.type}</span>
                        </td>
                        <td>{report.location}</td>
                        <td>{report.period}</td>
                        <td>{report.created}</td>
                        <td>
                          <span
                            className={`format-pill ${formatClass(
                              report.format
                            )}`}
                          >
                            {report.format}
                          </span>
                        </td>
                        <td>
                          <span className="report-status">
                            <i />
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              title="View full report"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              title={`Download ${report.format}`}
                              onClick={() => handleDownload(report)}
                            >
                              <Download size={16} />
                            </button>
                            <div className="row-action-relative">
                              <button
                                type="button"
                                title="More actions"
                                onClick={() =>
                                  setActionMenuId(
                                    actionMenuId === report.id ? null : report.id
                                  )
                                }
                              >
                                <MoreVertical size={16} />
                              </button>
                              {actionMenuId === report.id && (
                                <div className="row-action-dropdown">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setActionMenuId(null);
                                    }}
                                  >
                                    <Eye size={13} /> View Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDownload(report);
                                      setActionMenuId(null);
                                    }}
                                  >
                                    <Download size={13} /> Download File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handlePrintSelected(report);
                                      setActionMenuId(null);
                                    }}
                                  >
                                    <Printer size={13} /> Print Dossier
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="reports-pagination">
              <span>
                Showing{" "}
                {filteredReports.length === 0
                  ? 0
                  : rowsPerPage === "All"
                  ? 1
                  : (safePage - 1) * rowsPerPage + 1}
                -
                {rowsPerPage === "All"
                  ? filteredReports.length
                  : Math.min(safePage * rowsPerPage, filteredReports.length)}{" "}
                of {filteredReports.length} reports
              </span>

              <div className="page-buttons">
                <button
                  type="button"
                  disabled={safePage <= 1 || rowsPerPage === "All"}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>
                {rowsPerPage !== "All" &&
                  Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(
                      Math.max(0, safePage - 3),
                      Math.min(totalPages, safePage + 2)
                    )
                    .map((number) => (
                      <button
                        key={number}
                        type="button"
                        className={safePage === number ? "active" : ""}
                        onClick={() => setPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages || rowsPerPage === "All"}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <label className="rows-select">
                Rows
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRowsPerPage(v === "All" ? "All" : Number(v));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value="All">All</option>
                </select>
              </label>
            </div>
          </section>

          {/* Bottom Insights */}
          <section className="reports-insight-grid">
            <div className="insight-card">
              <div className="insight-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>{reports.length} Monitoring Reports Active</strong>
                <p>
                  Connected to real SQLite database predictions, station sensors, and
                  warning incident archives.
                </p>
              </div>
            </div>

            <div className="insight-card blue-border">
              <div className="insight-icon">
                <Clock3 size={20} />
              </div>
              <div>
                <strong>Latest Hydrological Report</strong>
                <p>
                  {reports[0]?.name || "Telemetry Summary"} ·{" "}
                  {reports[0]?.created || "Live Active"}
                </p>
              </div>
            </div>

            <div className="insight-card purple-border">
              <div className="insight-icon">
                <CalendarDays size={20} />
              </div>
              <div>
                <strong>Export & Dispatch Readiness</strong>
                <p>
                  {readyCount} reports compiled and ready for CSV export or PDF
                  civil protection distribution.
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* VIEW REPORT MODAL - REAL DATA DRIVEN */}
      {selectedReport && (
        <div
          className="report-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null);
          }}
        >
          <div className="report-modal">
            <div className="report-modal-header">
              <div>
                <div className="modal-badge-row">
                  <span
                    className={`format-pill large ${formatClass(
                      selectedReport.format
                    )}`}
                  >
                    {selectedReport.format}
                  </span>
                  {selectedReport.details?.risk_level && (
                    <span
                      className={`modal-risk-pill ${riskBadgeClass(
                        selectedReport.details.risk_level
                      )}`}
                    >
                      {selectedReport.details.risk_level} RISK
                    </span>
                  )}
                </div>
                <h3>{selectedReport.name}</h3>
                <p>
                  {selectedReport.id} · {selectedReport.created} ·{" "}
                  {selectedReport.location}
                </p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedReport(null)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Real Data Metrics Strip */}
            <div className="report-metrics-grid">
              <div className="report-metric-box">
                <span>Risk Level</span>
                <strong
                  className={riskBadgeClass(selectedReport.details?.risk_level)}
                >
                  {selectedReport.details?.risk_level || "LOW"}
                </strong>
                <small>Hydrological Severity</small>
              </div>

              <div className="report-metric-box">
                <span>Flood Probability</span>
                <strong>
                  {Math.round(
                    (selectedReport.details?.flood_probability || 0.1) * 100
                  )}
                  %
                </strong>
                <small>ML Prediction Confidence</small>
              </div>

              <div className="report-metric-box">
                <span>Peak Rainfall</span>
                <strong>
                  {selectedReport.details?.rainfall_mm_hr ||
                    selectedReport.details?.rain_1h ||
                    0}{" "}
                  mm/h
                </strong>
                <small>Maximum Rate Observed</small>
              </div>

              <div className="report-metric-box">
                <span>24h Total Rain</span>
                <strong>
                  {selectedReport.details?.rain_24h || 0} mm
                </strong>
                <small>Cumulative Precipitation</small>
              </div>

              <div className="report-metric-box">
                <span>Catchment Elevation</span>
                <strong>
                  {selectedReport.details?.elevation_m || "N/A"} m
                </strong>
                <small>Topographic Gauge</small>
              </div>

              <div className="report-metric-box">
                <span>Slope Gradient</span>
                <strong>
                  {selectedReport.details?.slope_degree || "N/A"}°
                </strong>
                <small>Runoff Velocity Factor</small>
              </div>
            </div>

            {/* Metadata Summary Grid */}
            <div className="report-detail-grid">
              <div>
                <span>Type</span>
                <strong>{selectedReport.type}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{selectedReport.location}</strong>
              </div>
              <div>
                <span>Observation Period</span>
                <strong>{selectedReport.period}</strong>
              </div>
              <div>
                <span>Authorized Officer</span>
                <strong>{selectedReport.owner}</strong>
              </div>
              <div>
                <span>Operational Status</span>
                <strong>{selectedReport.status}</strong>
              </div>
              <div>
                <span>File Size</span>
                <strong>{selectedReport.size}</strong>
              </div>
            </div>

            {/* Executive Summary & Narrative */}
            <div className="report-description">
              <h4>Executive Summary & Hydro Assessment</h4>
              <p>
                {selectedReport.details?.executiveSummary ||
                  selectedReport.description}
              </p>
            </div>

            {/* Telemetry Breakdown Parameters */}
            <div className="report-parameters-box">
              <h4>Rainfall Accumulation Telemetry</h4>
              <div className="parameters-table-grid">
                <div className="param-item">
                  <span>1-Hour Rain</span>
                  <strong>{selectedReport.details?.rain_1h || 0} mm</strong>
                </div>
                <div className="param-item">
                  <span>3-Hour Rain</span>
                  <strong>{selectedReport.details?.rain_3h || 0} mm</strong>
                </div>
                <div className="param-item">
                  <span>6-Hour Rain</span>
                  <strong>{selectedReport.details?.rain_6h || 0} mm</strong>
                </div>
                <div className="param-item">
                  <span>12-Hour Rain</span>
                  <strong>{selectedReport.details?.rain_12h || 0} mm</strong>
                </div>
                <div className="param-item">
                  <span>Rain Trend</span>
                  <strong>
                    {selectedReport.details?.rainfall_change > 0 ? "+" : ""}
                    {selectedReport.details?.rainfall_change || 0} mm/h
                  </strong>
                </div>
                <div className="param-item">
                  <span>Data Source</span>
                  <strong>
                    {selectedReport.details?.dataSource || "Station Telemetry"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Recommended Safety Actions */}
            {selectedReport.details?.recommendations &&
              selectedReport.details.recommendations.length > 0 && (
                <div className="report-actions-checklist">
                  <h4>Recommended Emergency Safety Actions</h4>
                  <ul>
                    {selectedReport.details.recommendations.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={15} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Modal Actions */}
            <div className="report-modal-actions">
              <button
                type="button"
                className="secondary-modal-btn"
                onClick={() => handlePrintSelected(selectedReport)}
              >
                <Printer size={15} /> Print Report
              </button>
              <button
                type="button"
                className="secondary-modal-btn"
                onClick={() => handleDownload(selectedReport)}
              >
                <Download size={15} /> Download {selectedReport.format}
              </button>
              <button
                type="button"
                className="primary-modal-btn"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {showGenerator && (
        <div
          className="report-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !generating)
              setShowGenerator(false);
          }}
        >
          <div className="generator-modal">
            <div className="generator-header">
              <div>
                <span>REPORT BUILDER</span>
                <h3>Generate a New Report</h3>
                <p>
                  Compile live weather telemetry and ML predictions into an
                  official monitoring report.
                </p>
              </div>
              <button
                type="button"
                disabled={generating}
                onClick={() => setShowGenerator(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="generator-grid">
              <label>
                <span>Report Type</span>
                <select
                  value={generatorType}
                  onChange={(e) => setGeneratorType(e.target.value)}
                >
                  {availableTypes
                    .filter((item) => item !== "All Report Types")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                <span>Location</span>
                <select
                  value={generatorLocation}
                  onChange={(e) => setGeneratorLocation(e.target.value)}
                >
                  {availableLocations
                    .filter((item) => item !== "All Locations")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                <span>Period</span>
                <select
                  value={generatorPeriod}
                  onChange={(e) => setGeneratorPeriod(e.target.value)}
                >
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Custom Range</option>
                </select>
              </label>

              <label>
                <span>Format</span>
                <select
                  value={generatorFormat}
                  onChange={(e) => setGeneratorFormat(e.target.value)}
                >
                  <option value="PDF">PDF (Printable Dossier)</option>
                  <option value="CSV">CSV (Tabular Data Export)</option>
                </select>
              </label>
            </div>

            <div className="generator-checklist">
              <div>
                <CheckCircle2 size={15} /> Real-time rainfall telemetry
              </div>
              <div>
                <CheckCircle2 size={15} /> ML flood risk probability
              </div>
              <div>
                <CheckCircle2 size={15} /> Topographic slope evaluation
              </div>
              <div>
                <CheckCircle2 size={15} /> Civil safety advisories
              </div>
            </div>

            <div className="generator-footer">
              <button
                type="button"
                className="secondary-modal-btn"
                disabled={generating}
                onClick={() => setShowGenerator(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-modal-btn"
                disabled={generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
