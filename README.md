# Flash Flood Prediction System

An AI-powered flash flood risk prediction system using a Random Forest machine-learning model, a FastAPI backend, and an interactive web frontend with a Leaflet map.

---

## Features

- 🌧️ **Flash flood risk prediction** using a trained Random Forest classifier
- 🗺️ **Interactive Leaflet map** for selecting geographic locations
- ⛰️ **Automatic terrain extraction** (elevation & slope) from real DEM data using `rasterio`
- 🌊 **Automatic rainfall feature extraction** from historical rainfall dataset
- 📊 **Prediction history** stored in browser local storage
- ⚡ **Real-time API status** indicator (Online / Offline)
- ✅ **Input validation** on all fields
- 📱 **Responsive design** for desktop and mobile

---

## Architecture

```
Frontend (HTML/CSS/JS + Leaflet.js)
        │
        │ HTTP
        ▼
FastAPI Backend (app/main.py)
        │
   ┌────┴────┐
   ▼         ▼
Terrain    Rainfall
Service    Service
(DEM .tif) (CSV data)
        │
        ▼
Random Forest Model
(ml/models/random_forest_flood.pkl)
```

---

## Directory Structure

```
flash-flood-prediction/
├── app/
│   ├── __init__.py
│   ├── main.py             ← FastAPI routes
│   ├── schemas.py          ← Pydantic request/response models
│   └── services/
│       ├── __init__.py
│       ├── terrain.py      ← Elevation & slope from DEM rasters
│       └── rainfall.py     ← Rainfall features from CSV dataset
│
├── data/
│   ├── dem/
│   │   ├── elevation.tif   ← Elevation DEM (lat 29-32, lon 78-81)
│   │   └── slope.tif       ← Slope derived from DEM
│   └── rainfall/
│       ├── rainfall_features.csv ← Pre-calculated multi-hour rainfall features
│       └── ...
│
├── ml/
│   ├── models/
│   │   └── random_forest_flood.pkl ← Trained model
│   └── train_random_forest.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── config.py
├── README.md
└── venv/
```

---

## ML Model

**Type:** Random Forest Classifier (scikit-learn)  
**File:** `ml/models/random_forest_flood.pkl`

### Input Features (9 features, order matters)

| # | Feature          | Description                   | Unit    |
|---|------------------|-------------------------------|---------|
| 1 | rainfall_mm_hr   | Current rainfall rate         | mm/hr   |
| 2 | elevation_m      | Terrain elevation             | meters  |
| 3 | slope_degree     | Terrain slope                 | degrees |
| 4 | rain_1h          | 1-hour rainfall accumulation  | mm      |
| 5 | rain_3h          | 3-hour rainfall accumulation  | mm      |
| 6 | rain_6h          | 6-hour rainfall accumulation  | mm      |
| 7 | rain_12h         | 12-hour rainfall accumulation | mm      |
| 8 | rain_24h         | 24-hour rainfall accumulation | mm      |
| 9 | rainfall_change  | Rate of change in rainfall    | mm/hr   |

### Output

| Field             | Description                  |
|-------------------|------------------------------|
| prediction        | `0` (No Flood) / `1` (Flood) |
| flood_probability | Probability between 0 and 1  |
| risk_level        | `LOW`, `MEDIUM`, or `HIGH`   |

**Risk thresholds:**
- `HIGH`: probability ≥ 0.70
- `MEDIUM`: probability ≥ 0.40
- `LOW`: probability < 0.40

> **Note:** Latitude and longitude are treated as **location metadata** only. They are **not** passed as features into the Random Forest model, which expects exactly 9 features as listed above.

---

## Dataset Description

### DEM / Terrain Data (`data/dem/`)

- **Coverage:** Latitude 29°N–32°N, Longitude 78°E–81°E (Uttarakhand, India region)
- **Files:** `elevation.tif`, `slope.tif`, plus SRTM 1-arc-second tiles
- **Format:** GeoTIFF, EPSG:4326 (WGS84)
- **Used for:** Automatic elevation and slope extraction by lat/lon via `rasterio`

### Rainfall Data (`data/rainfall/`)

- **Source:** IMERG (Integrated Multi-satellitE Retrievals for GPM)
- **Coverage:** Matching the Uttarakhand region, July 2024
- **Key file:** `rainfall_features.csv` — pre-calculated multi-hour accumulation features indexed by `timestamp`, `latitude`, `longitude`
- **Temporal resolution:** 30-minute intervals
- **Columns:** `timestamp`, `latitude`, `longitude`, `rainfall_mm_hr`, `rain_1h`, `rain_3h`, `rain_6h`, `rain_12h`, `rain_24h`, `rainfall_change`

---

## Backend Setup

```bash
cd ~/Desktop/flash-flood-prediction
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend runs at: **http://127.0.0.1:8000**

---

## Frontend Setup (React)

Open a new terminal:

```bash
cd ~/Desktop/flash-flood-prediction/react-frontend
npm install
npm run dev
```

Open in browser: **http://localhost:5173**

> **Note:** The Vite dev server is configured to proxy all `/api` requests to the FastAPI backend running on port 8000. Ensure both the backend and frontend are running simultaneously.

---

## API Endpoints

| Method | Endpoint      | Description                              |
|--------|---------------|------------------------------------------|
| GET    | `/`           | Root — check if server is running        |
| GET    | `/health`     | Health check                             |
| GET    | `/model-info` | Model metadata (features, classes)       |
| GET    | `/features`   | Get terrain & rainfall for a lat/lon     |
| POST   | `/predict`    | Run flood risk prediction                |

**Swagger docs:** http://127.0.0.1:8000/docs

---

## Example: Get Features for a Location

```bash
GET /features?latitude=30.0&longitude=79.5
```

**Response:**
```json
{
  "latitude": 30.0,
  "longitude": 79.5,
  "elevation_m": 1965.0,
  "slope_degree": 26.12,
  "rainfall_mm_hr": 0.5,
  "rain_1h": 0.45,
  "rain_3h": 1.88,
  "rain_6h": 2.13,
  "rain_12h": 2.21,
  "rain_24h": 14.18,
  "rainfall_change": 0.09,
  "error": null
}
```

---

## Example: Prediction Request

```bash
POST /predict
Content-Type: application/json

{
    "latitude": 29.849998,
    "longitude": 80.049995,
    "rainfall_mm_hr": 36.02,
    "elevation_m": 1755.0,
    "slope_degree": 40.387863,
    "rain_1h": 33.32,
    "rain_3h": 54.519999,
    "rain_6h": 79.099999,
    "rain_12h": 80.879999,
    "rain_24h": 87.204998,
    "rainfall_change": 5.400002
}
```

**Response:**
```json
{
    "location": {
        "latitude": 29.849998,
        "longitude": 80.049995
    },
    "prediction": 1,
    "flood_probability": 0.9999,
    "risk_level": "HIGH"
}
```

---

## Map Functionality

The frontend includes an interactive **Leaflet.js** map centered on the Uttarakhand region.

**Workflow:**
1. Click anywhere on the map — a marker appears and coordinates are filled in.
2. Click **"Use Location"** — the app fetches terrain (elevation, slope) and rainfall features from the backend automatically.
3. The prediction form is pre-filled with the extracted values.
4. Adjust any values manually if needed, then click **"Predict Flood Risk"**.

> **Coverage:** Automatic terrain and rainfall extraction only works for coordinates within the available dataset (roughly 29°N–32°N, 78°E–81°E). Locations outside this region return a clear error message.

---

## Terrain Extraction

Implemented in `app/services/terrain.py`.

- Uses `rasterio` to sample from `elevation.tif` and `slope.tif`.
- Checks if the selected point falls within the DEM bounding box before sampling.
- Returns `{"error": "..."}` if the location is outside coverage — no crashes.

---

## Rainfall Extraction

Implemented in `app/services/rainfall.py`.

- Queries `rainfall_features.csv` using nearest-neighbor matching on latitude/longitude.
- Uses the most-recent record from the sorted dataset for the closest location.
- Falls back gracefully with an error if the location is too far from any data point.

> **Important:** Rainfall data is **historical** (July 2024), not live/real-time. Values reflect the available dataset. Do not interpret these as current conditions.

---

## Testing

Run the full automated test suite:

```bash
source venv/bin/activate
python test_all.py
```

Tests cover:
- `GET /` root
- `GET /health`
- `GET /model-info`
- `POST /predict` baseline (known HIGH result)
- `POST /predict` with lat/lon metadata
- `GET /features` inside DEM bounds
- `GET /features` outside DEM bounds (error handling)
- `POST /predict` with missing required field (422 response)
- `POST /predict` with low rainfall (LOW risk)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `API Offline` in frontend | Start the backend: `uvicorn app.main:app --reload` |
| `Terrain data is not available` | The selected location is outside 29-32°N, 78-81°E |
| `Rainfall data not available` | The selected location is too far from any IMERG grid point |
| `ModuleNotFoundError` | Make sure venv is activated: `source venv/bin/activate` |
| Model not loading | Check `ml/models/random_forest_flood.pkl` exists |
| CORS errors in browser | Ensure backend is running on `127.0.0.1:8000` |

---

## Future Improvements

- [ ] Integrate live weather API (e.g., Open-Meteo) for real-time rainfall values
- [ ] Expand DEM coverage beyond the current Uttarakhand region
- [ ] Retrain model with latitude/longitude as additional features
- [ ] Add XGBoost / ensemble model comparison
- [ ] Add feature importance visualization in the UI
- [ ] Deploy backend to cloud (e.g., Railway, Render, AWS)
- [ ] Add alerting/notifications for HIGH risk events
- [ ] Store predictions in a database instead of local storage
