# Flash Flood Prediction & Real-Time Risk Monitoring System

## Project Overview
This project is an AI-powered Flash Flood Prediction System upgraded into a realistic, demo-ready flood monitoring application for West Bengal, India, especially Kolkata. It uses a Random Forest ML model to estimate the probability of a flash flood based on real-time and historical rainfall data, combined with terrain elevation and slope characteristics.

The system retrieves live weather and rainfall information for the selected location. It then constructs the nine features required by our trained Random Forest model and generates the flood-risk probability. Terrain values are extracted from our DEM where coverage is available; otherwise the system explicitly reports that terrain data is unavailable rather than using fabricated values.

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript. Uses Leaflet.js for interactive mapping and Chart.js for rainfall history visualization.
- **Backend**: FastAPI (Python). Serves ML predictions, extracts terrain features using rasterio, and integrates with external weather and reverse geocoding APIs.
- **ML Model**: Pre-trained Random Forest model (`app/ml/model.pkl`).

## Features
- **Interactive Map**: Leaflet map to select locations or use browser Geolocation.
- **Current Conditions**: Displays real-time Temperature, Humidity, and Wind Speed (via live APIs or Demo data).
- **Rainfall Monitoring**: 1h, 3h, 6h, 12h, and 24h accumulations with 7-day history trends.
- **Terrain Extraction**: Extracts `elevation_m` and `slope_degree` from local DEM GeoTIFF files automatically based on coordinates.
- **Realistic Risk Dashboard**: AI model assessments with visual indicators (LOW, MEDIUM, HIGH risk) and contextual explanations.
- **Data Honesty Mode**: Clearly displays the data source ("Live Weather API" vs "Dataset / Demo Data"). Graceful fallbacks when APIs are offline or coordinates are out of bounds.

## ML Model & Features
The existing Random Forest model expects exactly 9 features:
1. `rainfall_mm_hr`
2. `elevation_m`
3. `slope_degree`
4. `rain_1h`
5. `rain_3h`
6. `rain_6h`
7. `rain_12h`
8. `rain_24h`
9. `rainfall_change`

## Dataset Information
- **Terrain DEM**: GeoTIFF files located in `data/dem/` (`elevation.tif`, `slope.tif`). Currently, the bounds cover the Uttarakhand region.
- **Rainfall History**: Stored in `data/rainfall/`. Demo fallback mode simulates datasets for out-of-bound regions like Kolkata.

## API Endpoints
- `GET /health` - API Health status
- `POST /api/predict` - Make a flood prediction using the ML model
- `GET /api/features?latitude=...&longitude=...` - Extract terrain and weather features
- `GET /api/rainfall/history?latitude=...&longitude=...` - Get 7-day rainfall history
- `GET /api/location?latitude=...&longitude=...` - Get reverse geocoded location name

## Installation & Setup

1. **Virtual Environment Setup**:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory.
   ```env
   WEATHER_API_KEY=your_optional_api_key
   ```
   *Note: If no API key is provided, the application safely falls back to Dataset/Demo mode.*

3. **Running the Backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Running the Frontend**:
   Simply open `frontend/index.html` in your browser, or use a local server:
   ```bash
   cd frontend
   python -m http.server 5173
   ```

## Testing
- Test API Health: `curl http://127.0.0.1:8000/health`
- Test Map Selection: Click anywhere on the map, ensure coordinates populate.
- Test "Kolkata Demo": Click the button and run a prediction. Verify realistic UI fallback is used.
- Test Backend Offline Behavior: Stop the backend server and ensure the frontend UI does not crash, displaying an "API Offline" badge.

## Limitations & Future Improvements
- **DEM Coverage**: Current DEM files only cover Uttarakhand. The app handles this gracefully, but larger DEMs are needed for full national coverage.
- **Database**: Prediction history uses browser `localStorage`. A future improvement could store this in a PostgreSQL database for persistent analytics.
