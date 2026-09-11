# Flash Flood Prediction & Monitoring System

## Project Overview
A production-ready location-aware, real-time flash flood monitoring and prediction platform focused on West Bengal (and Uttarakhand). This system integrates live weather APIs, a Random Forest ML model, raster DEM files, and PostgreSQL to deliver accurate risk assessments. 

## Features
- **Dynamic Risk Dashboard**: Fully integrated React + Leaflet frontend that updates entirely based on global `LocationContext`. 
- **Global Search & Geolocation**: Nominatim forward/reverse geocoding allows searching for any region (e.g. "Kolkata", "Howrah") or using browser Geolocation.
- **Data Honesty Strategy**: All dashboard metrics distinctly display whether data comes from LIVE sources (Open-Meteo), local DATASETS (Raster DEMs), or DEMO fallback values.
- **Robust Terrain Strategy**: Uses Rasterio to extract elevation and slope from GeoTIFFs. Automatically skips ML prediction if terrain is out-of-bounds, rather than faking terrain values.
- **Event History & Alerting**: Persistent PostgreSQL database records predictions and spawns alerts when thresholds are breached.

## Architecture
```
[React Frontend] (Vite + Leaflet)
       | (LocationContext)
[FastAPI Backend] 
       |---> [Location Service] -> Nominatim
       |---> [Weather Service]  -> Open-Meteo
       |---> [Terrain Service]  -> Rasterio (Local DEMs)
       |---> [ML Service]       -> Random Forest (9 Features)
       |---> [Database]         -> PostgreSQL (SQLAlchemy)
```

## Technology Stack
- **Frontend**: React.js, Vite, React-Leaflet, Lucide Icons, Context API
- **Backend**: FastAPI, SQLAlchemy, Pydantic, httpx
- **Machine Learning**: Scikit-learn (RandomForestClassifier), Joblib
- **Geospatial**: Rasterio, GeoTIFF, Nominatim
- **Database**: PostgreSQL (Production) / SQLite (Development Fallback)
- **DevOps**: Docker, Docker Compose

## ML Model & Features
The core Random Forest model predicts flood probabilities strictly using the following 9 ordered features:
1. `rainfall_mm_hr`: Current hourly rainfall
2. `elevation_m`: Terrain elevation (meters)
3. `slope_degree`: Terrain slope (degrees)
4. `rain_1h`: Past 1 hr accumulation
5. `rain_3h`: Past 3 hr accumulation
6. `rain_6h`: Past 6 hr accumulation
7. `rain_12h`: Past 12 hr accumulation
8. `rain_24h`: Past 24 hr accumulation
9. `rainfall_change`: Delta indicating storm intensity

*(Note: Latitude/Longitude are explicitly excluded from the model to prevent spatial bias).*

## Running Locally

### Option 1: Docker (Recommended)
```bash
docker-compose up --build
```
This spins up PostgreSQL, the FastAPI Backend (port 8000), and the React Frontend (port 5173).

### Option 2: Manual
**1. Backend:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
**2. Frontend:**
```bash
cd react-frontend
npm install
npm run dev
```

## Limitations & Future Improvements
- **Terrain Coverage**: The current DEM files (`elevation.tif`, `slope.tif`) predominantly cover Uttarakhand. Searching for Kolkata gracefully triggers a "Terrain Unavailable" failsafe to protect model integrity. A global DEM API (e.g. Copernicus) should be integrated.
- **Persistent State**: Adding Redis for caching Open-Meteo responses during traffic spikes.
