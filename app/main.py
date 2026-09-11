from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exceptions import unexpected_error_handler

from app.api.location.routes import router as location_router
from app.api.district.routes import router as district_router
from app.api.auth.routes import router as auth_router
from app.api.prediction.routes import router as prediction_router


app = FastAPI(
    title="Flash Flood Prediction System API",
    version="1.0.0",
)

app.add_exception_handler(
    Exception,
    unexpected_error_handler,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router,prefix="/api",)
app.include_router(prediction_router,prefix="/api",)
app.include_router(location_router, prefix="/api")
app.include_router(district_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Flash Flood Prediction System API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
@app.get("/api/features")
def get_features(latitude: float, longitude: float):
    from app.services.weather_service import get_rainfall_data
    import random
    
    # Mock terrain since arbitrary locations aren't in the DB
    elevation_m = random.uniform(100, 2500)
    slope_degree = random.uniform(0, 45)
    
    try:
        weather = get_rainfall_data(latitude=latitude, longitude=longitude)
    except Exception:
        weather = {
            "rain_1h": 0.0, "rain_3h": 0.0, "rain_6h": 0.0,
            "rain_12h": 0.0, "rain_24h": 0.0
        }
        
    return {
        "elevation_m": elevation_m,
        "slope_degree": slope_degree,
        "rainfall_mm_hr": weather.get("rain_1h", 0.0),
        "rain_1h": weather.get("rain_1h", 0.0),
        "rain_3h": weather.get("rain_3h", 0.0),
        "rain_6h": weather.get("rain_6h", 0.0),
        "rain_12h": weather.get("rain_12h", 0.0),
        "rain_24h": weather.get("rain_24h", 0.0),
    }

from pydantic import BaseModel
class LegacyPredictRequest(BaseModel):
    latitude: float
    longitude: float
    elevation_m: float
    slope_degree: float
    rainfall_mm_hr: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float

@app.post("/api/predict")
def legacy_predict(request: LegacyPredictRequest):
    from app.ml.model_loader import model
    rainfall_change = request.rain_1h - (request.rain_3h / 3.0)
    data = [[
        request.rainfall_mm_hr,
        request.elevation_m,
        request.slope_degree,
        request.rain_1h,
        request.rain_3h,
        request.rain_6h,
        request.rain_12h,
        request.rain_24h,
        rainfall_change
    ]]
    prediction = int(model.predict(data)[0])
    probability = float(model.predict_proba(data)[0][1])
    
    if probability >= 0.70:
        risk_level = "HIGH"
    elif probability >= 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    return {
        "location": {"latitude": request.latitude, "longitude": request.longitude},
        "prediction": prediction,
        "flood_probability": probability,
        "risk_level": risk_level,
        "rainfall_change": rainfall_change
    }

@app.get("/features")
def legacy_get_features(latitude: float, longitude: float):
    return get_features(latitude, longitude)

@app.post("/predict")
def old_legacy_predict(request: LegacyPredictRequest):
    return legacy_predict(request)

@app.get("/api/health")
def api_health():
    return health()
