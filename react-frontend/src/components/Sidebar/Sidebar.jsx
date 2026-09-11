import { LocationContext } from '../../context/LocationContext';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import React, { useState } from "react";

import {
  LayoutDashboard,
  Map,
  ChartNoAxesCombined,
  MapPin,
  CloudSun,
  History,
  Bell,
  FileText,
  Settings,
  CircleHelp,
  Terminal,
  Bot,
  Sparkles,
  User,
  UserRound,
  SlidersHorizontal,
  BellRing,
  Ruler,
  Shield,
  UsersRound,
  KeyRound,
  ClipboardList,
  DatabaseBackup,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import ChatBot from "../ChatBot/ChatBot";
import logo from "../../assets/flashflood-logo.png";

import "./Sidebar.css";

function Sidebar({
  activePage = "dashboard",
  activeSubPage = "preferences",
  onNavigate,
  onHome,
  onSubNavigate,
}) {
  const { location, lastUpdate, apiOnline, alerts } = useContext(LocationContext);
  const { user } = useContext(AuthContext);

  const [settingsOpen, setSettingsOpen] = useState(
    activePage === "settings"
  );

  const [chatOpen, setChatOpen] = useState(false);

  const [selectedSubPage, setSelectedSubPage] = useState(
    activeSubPage || "preferences"
  );

  const baseMenuItems = [
    {
      id: "dashboard",
      label: "User Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "riskmap",
      label: "Risk Map",

      icon: Map,
    },
    {
      id: "prediction",
      label: "Prediction",
      icon: ChartNoAxesCombined,
    },
    {
      id: "locations",
      label: "Locations",
      icon: MapPin,
    },
    {
      id: "weather",
      label: "Weather & Data",
      icon: CloudSun,
    },
    {
      id: "historical",
      label: "Historical Analysis",
      icon: History,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: alerts?.length || 0,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      expandable: true,
    },
  ];

  let menuItems = [...baseMenuItems];
  if (user?.role === "admin") {
    menuItems.unshift({ id: "admin", label: "Admin Panel", icon: Shield });
  } else if (user?.role === "gov") {
    menuItems.unshift({ id: "gov", label: "Gov Panel", icon: UsersRound });
  }

  const settingsItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
     
    {
      id: "preferences",
      label: "Preferences",
      icon: SlidersHorizontal,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: BellRing,
    },
    {
      id: "data-units",
      label: "Data & Units",
      icon: Ruler,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
    },
    {
      id: "access-roles",
      label: "Access & Roles",
      icon: UsersRound,
    },
    {
      id: "api-integrations",
      label: "API & Integrations",
      icon: KeyRound,
    },
    {
      id: "activity-log",
      label: "Activity Log",
      icon: ClipboardList,
    },
    {
      id: "backup-restore",
      label: "Backup & Restore",
      icon: DatabaseBackup,
    },
    {
      id: "about",
      label: "About",
      icon: Info,
    },
  ];

  const handleMenuClick = (item) => {
    if (item.id === "settings") {
      setSettingsOpen((value) => !value);
      if (onNavigate) {
        onNavigate("settings-profile");   // open settings at Profile tab
      }
      return;
    }
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const handleSubItemClick = (item) => {
    setSelectedSubPage(item.id);

    if (onSubNavigate) {
      onSubNavigate(item.id);
    }

    if (onNavigate) {
      onNavigate(`settings-${item.id}`);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <button
        type="button"
        className="sidebar-brand"
        onClick={onHome}
        aria-label="Back to home"
      >
        <img
          src={logo}
          alt="FlashFlood Prediction System"
          className="sidebar-brand-logo"
        />
      </button>

      {/* Main Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                className={`sidebar-menu-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => handleMenuClick(item)}
                aria-expanded={
                  item.id === "settings" ? settingsOpen : undefined
                }
              >
                <Icon size={21} strokeWidth={1.8} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}

                {item.expandable && (
                  <span className="sidebar-expand-icon">
                    {settingsOpen ? (
                      <ChevronUp size={15} strokeWidth={2} />
                    ) : (
                      <ChevronDown size={15} strokeWidth={2} />
                    )}
                  </span>
                )}
              </button>

              {item.id === "settings" && settingsOpen && (
                <div className="sidebar-submenu">
                  {settingsItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive =
                      selectedSubPage === subItem.id;

                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        className={`sidebar-submenu-item ${
                          isSubActive ? "active" : ""
                        }`}
                        onClick={() =>
                          handleSubItemClick(subItem)
                        }
                      >
                        <SubIcon
                          size={14}
                          strokeWidth={1.8}
                        />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Current Location */}
      <div className="sidebar-location">
        <h4>Current Location</h4>

        <p>
          <MapPin size={15} />
          {location.name}, {location.state}
        </p>

        <p className="coordinates">
          {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
        </p>

        <button type="button">Change Location</button>
      </div>

      {/* System Status */}
      <div className="sidebar-status">
        <h4>System Status</h4>

        <p>
          <span className={`status-dot ${apiOnline ? '' : 'offline'}`} style={{ backgroundColor: apiOnline ? 'var(--success-color, #10b981)' : '#ef4444' }}></span>
          {apiOnline ? "All Systems Operational" : "API Offline"}
        </p>

        <small className="sidebar-status-updated">
          Last Updated
        </small>

        <span className="sidebar-status-time">
          {lastUpdate ? lastUpdate.toLocaleString() : "Unknown"}
        </span>

        <p className="sidebar-live-status">
          <span className="status-dot"></span>
          Live Data Active
        </p>
      </div>

      {/* HydroCopilot Assistant */}
      <div
        className="sidebar-help interactive-help"
        onClick={() => setChatOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setChatOpen((prev) => !prev);
          }
        }}
        title="Toggle HydroCopilot Console (Ctrl+K)"
      >
        <div className="sidebar-help-icon-wrapper">
          <Terminal size={20} className="sidebar-help-bot-icon" />
          <span className="sidebar-help-pulse-dot" />
        </div>

        <div className="sidebar-help-text">
          <div className="sidebar-help-header">
            <strong>HydroCopilot</strong>
            <span className="sidebar-help-badge">v2.4</span>
          </div>
          <small>Console & Triage (Ctrl+K)</small>
        </div>
      </div>

      {/* Embedded ChatBot Component */}
      <ChatBot
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        activePage={activePage}
        showFloatingTrigger={!chatOpen}
      />
    </aside>
  );
}

export default Sidebar;
