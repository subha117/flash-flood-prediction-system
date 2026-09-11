from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictionRequest, PredictionResponse, FeaturesResponse, LocationMetadata
from .services.terrain import get_terrain_features
from .services.rainfall import get_rainfall_features

# --------------------------------------------------
# APP SETUP
# --------------------------------------------------
app = FastAPI(
    title="Flash Flood Prediction API",
    description="Machine learning API for flash flood risk prediction",
    version="1.0.0",
)

# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "models" / "random_forest_flood.pkl"
model = joblib.load(MODEL_PATH)

FEATURES = [
    "rainfall_mm_hr",
    "elevation_m",
    "slope_degree",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rainfall_change",
]

# --------------------------------------------------
# ROUTES
# --------------------------------------------------
@app.get("/")
def root():
    return {"message": "Flash Flood Prediction API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "random_forest_flood"}

@app.get("/model-info")
def model_info():
    return {
        "model": "Random Forest Classifier",
        "features": FEATURES,
        "classes": [0, 1]
    }

@app.get("/features", response_model=FeaturesResponse)
def get_features(latitude: float, longitude: float):
    """
    Retrieve terrain and rainfall features for a given location.
    """
    terrain = get_terrain_features(latitude, longitude)
    if "error" in terrain:
        return FeaturesResponse(latitude=latitude, longitude=longitude, error=terrain["error"])
        
    rainfall = get_rainfall_features(latitude, longitude)
    if "error" in rainfall:
        return FeaturesResponse(latitude=latitude, longitude=longitude, error=rainfall["error"])
        
    return FeaturesResponse(
        latitude=latitude,
        longitude=longitude,
        elevation_m=terrain.get("elevation_m"),
        slope_degree=terrain.get("slope_degree"),
        rainfall_mm_hr=rainfall.get("rainfall_mm_hr"),
        rain_1h=rainfall.get("rain_1h"),
        rain_3h=rainfall.get("rain_3h"),
        rain_6h=rainfall.get("rain_6h"),
        rain_12h=rainfall.get("rain_12h"),
        rain_24h=rainfall.get("rain_24h"),
        rainfall_change=rainfall.get("rainfall_change")
    )

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Only use exactly the 9 features the model was trained on
    data = pd.DataFrame(
        [[
            request.rainfall_mm_hr,
            request.elevation_m,
            request.slope_degree,
            request.rain_1h,
            request.rain_3h,
            request.rain_6h,
            request.rain_12h,
            request.rain_24h,
            request.rainfall_change,
        ]],
        columns=FEATURES,
    )

    prediction = int(model.predict(data)[0])
    probability = float(model.predict_proba(data)[0][1])

    if probability >= 0.70:
        risk_level = "HIGH"
    elif probability >= 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    response = PredictionResponse(
        prediction=prediction,
        flood_probability=round(probability, 4),
        risk_level=risk_level,
    )
    
    # Safely attach location metadata if it was provided
    if request.latitude is not None and request.longitude is not None:
        response.location = LocationMetadata(
            latitude=request.latitude,
            longitude=request.longitude
        )

    return response