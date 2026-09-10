from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# --------------------------------------------------
# APP
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

MODEL_PATH = (
    BASE_DIR
    / "ml"
    / "models"
    / "random_forest_flood.pkl"
)

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

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
# REQUEST MODEL
# --------------------------------------------------

class PredictionRequest(BaseModel):
    rainfall_mm_hr: float
    elevation_m: float
    slope_degree: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float
    rainfall_change: float


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Flash Flood Prediction API",
        "status": "running",
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "random_forest_flood",
    }


# --------------------------------------------------
# PREDICTION
# --------------------------------------------------

@app.post("/predict")
def predict(request: PredictionRequest):

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

    # Make prediction
    prediction = int(model.predict(data)[0])

    # Get probability of flood class
    probability = float(
        model.predict_proba(data)[0][1]
    )

    # Determine risk level
    if probability >= 0.70:
        risk_level = "HIGH"

    elif probability >= 0.40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "prediction": prediction,
        "flood_probability": round(probability, 4),
        "risk_level": risk_level,
    }