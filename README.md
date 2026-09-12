# 🌊 HydroGuard — Flash Flood Prediction & Early Warning System

<p align="center">
  <img src="react-frontend/src/assets/flashflood-logo.png" alt="HydroGuard Logo" width="130" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <strong>An Intelligent, Real-Time Hydrological Monitoring, Machine Learning Prediction & Civil Defense Platform</strong>
</p>

<p align="center">
  <a href="https://github.com/subha117/flash-flood-prediction-system"><img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=github" alt="Status"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://scikit-learn.org/"><img src="https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
</p>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Machine Learning Engine](#-machine-learning-engine)
- [Dashboard & UI Showcase](#-dashboard--ui-showcase)
- [API Reference](#-api-reference)
- [Quickstart & Installation](#-quickstart--installation)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Default Demo Accounts](#-default-demo-accounts)
- [Roadmap & Contributing](#-roadmap--contributing)

---

## 🚀 Executive Overview

**HydroGuard** is an end-to-end meteorological and geospatial intelligence platform engineered to forecast flash flood hazards before they strike. By synthesizing real-time open-source weather telemetry (Open-Meteo), Digital Elevation Models (DEMs via Rasterio), and an ensemble Random Forest machine learning pipeline, HydroGuard delivers instantaneous risk probabilities, localized impact assessments, and life-saving early warnings.

Built for **Civil Defense Agencies, Disaster Response Teams, and Citizens**, the platform features a responsive SaaS interface with interactive GIS maps, simulated flood lab tooling, automated GPS syncing, and an integrated AI assistant (**HydroCopilot**).

---

## ✨ Key Features

### 🌊 1. High-Precision Flash Flood Forecasting
- **Random Forest Classifier**: Evaluates 9 continuous hydrological and topographical vectors in real time.
- **Dynamic Risk Categorization**: Outputs flood probability from `0%` to `100%` categorized into `LOW`, `MODERATE`, `HIGH`, and `CRITICAL` risk tiers.
- **Fail-Safe Fallbacks**: Incorporates physical slope-drainage heuristics when satellite DEM rasters are out-of-bounds, ensuring 100% uptime with complete data integrity.

### 📍 2. Location-Aware GPS & Reverse Geocoding
- **One-Click GPS Sync**: Leverages browser `navigator.geolocation` for instant coordinate resolution.
- **Intelligent OSM Nominatim Geocoding**: Prioritizes city, town, and district names over narrow alleyways for clean geographic labeling.
- **Multi-Region Support**: Pre-calibrated for high-vulnerability mountainous basins (Uttarakhand) and deltaic flood plains (West Bengal).

### 🌦️ 3. Real-Time Meteorological Telemetry
- **Live Atmosphere Tracking**: Pulls live temperature, feels-like temperature, humidity, surface pressure, visibility, wind speed, and cardinal wind direction.
- **Hyetograph Precipitation Windows**: Computes rolling precipitation accumulation windows for `1h`, `3h`, `6h`, `12h`, and `24h` plus rainfall rate change ($\Delta R$).
- **8-Interval Hourly Forecast**: Visual hourly weather condition timeline with precipitation radar probability.

### 📊 4. Historical Analysis & Trend Intelligence
- **Longitudinal Trend Analytics**: Multi-year flood frequency and high-risk day distributions.
- **Interactive SVG Charts**: Line curves with area gradient fills and rainfall-versus-flood bar charts.
- **Radar Pulsing Map**: Geospatial event map with animated halo pulses (`@keyframes histPulseHalo`) highlighting critical danger zones.
- **One-Click CSV Data Export**: Download filtered historical disaster datasets for external research and reporting.

### 🤖 5. HydroCopilot AI Emergency Assistant
- **Embedded Conversational Agent**: Natural language triage console accessible throughout all dashboards (keyboard shortcut: `Ctrl+K`).
- **Situation Assessment**: Instant recommendations on flood safety, evacuation checklists, rainfall trends, and route advisories.
- **Context-Aware Knowledge**: Queries active dashboard telemetry and flood alert states automatically.

### 🚨 6. Government Broadcast & Civil Defense Alerts
- **Live Alert Dispatch**: Authorized government officials can broadcast evacuation notices and emergency alerts directly into citizen dashboards.
- **Real-Time Notification Center**: Interactive bell notification dropdown displaying active flood warnings with severity-coded badges.

### 🛡️ 7. Enterprise RBAC Security
- **Role-Based Access Control**: Tailored experiences for `Citizen / User`, `Government Official`, and `System Admin`.
- **Cryptographic Security**: Native `bcrypt` password hashing with truncated safety buffers and signed `JWT` bearer tokens with configurable expiration.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React 18 + Vite + Leaflet)"]
        UI[Interactive SaaS UI]
        Map[Leaflet Geospatial Map]
        Copilot[HydroCopilot AI Assistant]
        Ctx[LocationContext & AuthContext]
    end

    subgraph API ["Backend API Gateway (FastAPI)"]
        Router[FastAPI Route Dispatcher]
        Auth[JWT & Bcrypt Security Middleware]
        RBAC[Role-Based Access Control]
    end

    subgraph CoreServices ["Core Application Services"]
        ML[ML Prediction Service]
        Weather[Live Weather Service]
        Geo[Location & Geocoding Service]
        Alerts[Alert & Broadcast Service]
    end

    subgraph ExternalData ["External Data & Engines"]
        OpenMeteo[Open-Meteo REST API]
        Nominatim[OpenStreetMap Nominatim]
        GeoTIFF[Rasterio GeoTIFF DEMs]
        RFModel[Random Forest Model (.pkl / .joblib)]
    end

    subgraph Storage ["Persistence Layer"]
        DB[(PostgreSQL / SQLite)]
    end

    UI --> Ctx
    Ctx --> Router
    Copilot --> Router
    Router --> Auth
    Auth --> RBAC
    RBAC --> ML
    RBAC --> Weather
    RBAC --> Geo
    RBAC --> Alerts
    
    ML --> RFModel
    ML --> GeoTIFF
    Weather --> OpenMeteo
    Geo --> Nominatim
    Alerts --> DB
    Router --> DB
```

---

## 🧠 Machine Learning Engine

The prediction pipeline evaluates flood likelihood strictly based on physical and hydrological indicators, explicitly omitting geographic coordinates to eliminate spatial bias.

### Model Features (Ordered Vector)

| # | Feature | Unit | Description | Hydrological Rationale |
|---|---|:---:|---|---|
| **1** | `rainfall_mm_hr` | `mm/hr` | Current hourly rainfall intensity | Immediate storm intensity |
| **2** | `elevation_m` | `meters` | Topographic altitude | Basin runoff accumulation factor |
| **3** | `slope_degree` | `degrees` | Topographic gradient | Overland flow velocity & pooling |
| **4** | `rain_1h` | `mm` | Past 1-hour precipitation | Flash response trigger |
| **5** | `rain_3h` | `mm` | Past 3-hour precipitation | Short-term sub-catchment saturation |
| **6** | `rain_6h` | `mm` | Past 6-hour precipitation | Catchment drainage lag indicator |
| **7** | `rain_12h` | `mm` | Past 12-hour precipitation | Soil saturation milestone |
| **8** | `rain_24h` | `mm` | Past 24-hour precipitation | Total storm volume threshold |
| **9** | `rainfall_change` | `mm` | Rate of rainfall change ($\Delta R$) | Storm acceleration / peak detection |

### Mathematical Risk Formulation
$$\text{Risk Level} = \begin{cases} 
\text{CRITICAL} & \text{if } P(\text{Flood}) \ge 0.80 \\
\text{HIGH}     & \text{if } 0.60 \le P(\text{Flood}) < 0.80 \\
\text{MODERATE} & \text{if } 0.30 \le P(\text{Flood}) < 0.60 \\
\text{LOW}      & \text{if } P(\text{Flood}) < 0.30
\end{cases}$$

---

## 💻 Dashboard & UI Showcase

| View | Features & Highlights |
|---|---|
| **Overview Dashboard** | Real-time risk cards, perfectly height-matched Leaflet Flood Map with live markers, 7-day past rainfall trend graph, and quick status pills. |
| **Prediction Lab** | Interactive gauge meter with animated needle, dynamic parameter sliders, what-if simulations, and recent prediction log. |
| **Weather & Data Station** | Live GPS sync button, temperature/humidity/pressure/wind station tiles, 8-hour forecast timeline, and station sensor health status. |
| **Historical Analysis** | Pulsing radar risk map, SVG area gradient curves, multi-year flood event frequency, risk donut chart, and top 10 rainfall records table. |
| **HydroCopilot AI** | Natural language emergency console, weather triage, automated advice, and keyboard shortcuts (`Ctrl+K`). |
| **Gov & Admin Panels** | Emergency broadcast publisher, user roster management, system audit logs, and server health diagnostics. |

---

## 📡 API Reference

### Meteorological & Prediction Endpoints
- `POST /predict` or `POST /api/predict` — Execute ML inference on an input feature payload.
- `GET /api/weather/live?latitude={lat}&longitude={lng}` — Fetch live weather, 24h accumulation, and hourly forecast.
- `GET /api/weather/history?latitude={lat}&longitude={lng}` — Retrieve 7-day past rainfall accumulation.
- `GET /api/location?latitude={lat}&longitude={lng}` — Reverse geocode coordinates to city/district/state.
- `GET /api/predictions/history` — Query logged flood predictions from database.

### Alerting & Civil Defense
- `GET /api/alerts` — Fetch active disaster alerts.
- `POST /api/alerts/broadcast` — Broadcast an emergency warning notice (*Government/Admin role*).

### Authentication & RBAC
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Authenticate and receive a signed JWT access token.
- `GET /api/auth/me` — Retrieve current authenticated profile.

---

## ⚡ Quickstart & Installation

### Option 1: One-Click Launch (Windows PowerShell)
If you are on Windows, start both FastAPI and React Vite with a single command:
```powershell
.\run_project.ps1
```

---

### Option 2: Docker Compose (All Operating Systems)
Run the full production stack (FastAPI, React Vite, PostgreSQL) in isolated containers:
```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Option 3: Manual Local Development Setup

#### 1. Backend Setup
```bash
# Clone repository
git clone https://github.com/subha117/flash-flood-prediction-system.git
cd flash-flood-prediction-system

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup
Open a new terminal window:
```bash
cd react-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 📂 Project Directory Structure

```plaintext
flash-flood-prediction-system/
├── app/                              # FastAPI Backend Source
│   ├── api/                          # Route handlers (auth, admin, settings, alerts)
│   ├── core/                         # Configuration, database connection, JWT & security
│   ├── models/                       # SQLAlchemy ORM models (User, Prediction, Alert)
│   ├── schemas/                      # Pydantic schemas and request validators
│   ├── services/                     # Business logic
│   │   ├── location_service.py       # Nominatim reverse geocoding & address formatting
│   │   ├── ml_service.py             # Random Forest inference & heuristic fallbacks
│   │   ├── terrain_service.py        # Rasterio DEM raster extraction (elevation/slope)
│   │   └── weather_service.py        # Open-Meteo live atmospheric & hourly telemetry
│   └── main.py                       # FastAPI application entrypoint
├── ml/                               # Machine learning datasets and training artifacts
├── react-frontend/                   # React 18 + Vite Frontend Source
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, HydroCopilot ChatBot
│   │   ├── context/                  # LocationContext, AuthContext
│   │   ├── pages/                    # Dashboards & Auth Pages
│   │   │   ├── Dashboards/
│   │   │   │   ├── Dashboard/        # Main overview (Map + Rainfall trend)
│   │   │   │   ├── Prediction/       # Prediction Lab with gauge needle
│   │   │   │   ├── WeatherData/      # Weather telemetry & live GPS sync
│   │   │   │   ├── HistoricalAnalysis# Radar map, charts & CSV export
│   │   │   │   ├── Alerts/           # Civil defense warning center
│   │   │   │   ├── AdminDashboard/   # Admin user & system management
│   │   │   │   ├── GovDashboard/     # Government alert broadcaster
│   │   │   │   └── Settings/         # Profile, security, notifications
│   │   │   ├── Login/                # User login page
│   │   │   └── Signup/               # User registration page
│   │   └── services/                 # AI agent service and API clients
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml                # Multi-container orchestration
├── Dockerfile                        # Backend container recipe
├── requirements.txt                  # Python dependencies
├── run_project.ps1                   # Windows 1-click startup automation script
└── README.md                         # Project documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```ini
# Environment Mode
ENVIRONMENT=development

# Database Configuration (PostgreSQL for prod, SQLite for dev)
DATABASE_URL=sqlite:///./flashflood.db
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flashflood

# JWT Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Open-Meteo & External APIs
OPEN_METEO_TIMEOUT=6.0
NOMINATIM_USER_AGENT=HydroGuard-Flood-System
```

---

## 👥 Default Demo Accounts

For immediate testing, use the following pre-configured credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen / User** | `user@example.com` | `user123` | Public monitoring, weather, simulation lab |
| **Government Official** | `gov@example.com` | `gov123` | Emergency alert broadcast & civil defense panel |
| **System Administrator** | `admin@example.com` | `admin123` | Full access, user roster, audit logs, system health |

---

## 🗺️ Roadmap & Future Enhancements

- [x] **Real-Time GPS Location Auto-Detection**: Complete with OpenStreetMap reverse geocoding.
- [x] **Modernized Historical Analysis Dashboard**: Pulsing radar map, SVG area fills, and high-legibility typography.
- [x] **HydroCopilot AI Assistant**: Interactive terminal and conversational disaster advisory.
- [ ] **Copernicus Global DEM Integration**: Expand continuous 30m Digital Elevation Model rasters worldwide.
- [ ] **SMS / WhatsApp Emergency Sirens**: Twilio integration for automated cellular alerts to residents in critical risk zones.
- [ ] **Satellite Multispectral Inundation Overlay**: Sentinel-1 SAR imagery processing for ground-truth flood boundary validation.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for academic, governmental, or commercial applications.

---

<p align="center">
  Built with ❤️ for disaster preparedness and climate resilience.
</p>
