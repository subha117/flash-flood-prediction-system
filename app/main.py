from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import engine, Base, get_db
from app.models.prediction import Prediction, Alert
from app.models.user import User  # noqa: F401 — ensure users table is created
from app.models.user_settings import UserSettings  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401
from app.schemas.prediction import PredictionCreate, PredictionResponse, AlertResponse
from app.services.ml_service import ml_service
from app.services.weather_service import get_live_weather, get_rainfall_history
from app.services.terrain_service import get_terrain_data
from app.services.location_service import reverse_geocode, search_location
from app.api.auth.routes import router as auth_router
from app.api.settings import router as settings_router
from app.api.activity import router as activity_router
from app.api.admin import router as admin_router

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flash Flood Prediction System", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(activity_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/location")
def get_location(latitude: float, longitude: float):
    return reverse_geocode(latitude, longitude)

@app.get("/api/locations/search")
@app.get("/api/location/search")
def get_location_search(q: str):
    return search_location(q)

@app.get("/api/features")
def get_features(latitude: float, longitude: float):
    weather = get_live_weather(latitude, longitude)
    terrain = get_terrain_data(latitude, longitude)
    
    return {
        **weather,
        **terrain
    }

@app.get("/api/rainfall/history")
def get_history(latitude: float, longitude: float):
    return get_rainfall_history(latitude, longitude)

@app.post("/api/predictions", response_model=PredictionResponse)
def create_prediction(pred: PredictionCreate, db: Session = Depends(get_db)):
    # Run ML Model
    ml_result = ml_service.predict(pred.dict())
    
    # Save to DB
    pred_data = pred.dict()
    pred_data["prediction"] = ml_result["prediction"]
    pred_data["flood_probability"] = ml_result["flood_probability"]
    pred_data["risk_level"] = ml_result["risk_level"]
    
    db_pred = Prediction(**pred_data)
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    
    if db_pred.risk_level in ["HIGH", "CRITICAL"]:
        alert = Alert(
            location_name=db_pred.location_name,
            latitude=db_pred.latitude,
            longitude=db_pred.longitude,
            risk_level=db_pred.risk_level,
            probability=db_pred.flood_probability,
            reason=f"High rainfall detected over short period. Model outputs {db_pred.risk_level} risk.",
            data_source=db_pred.data_source
        )
        db.add(alert)
        db.commit()
        
    return db_pred

@app.get("/api/predictions/history")
def get_predictions_history(db: Session = Depends(get_db)):
    return db.query(Prediction).order_by(Prediction.timestamp.desc()).limit(500).all()

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.resolved == False).order_by(Alert.timestamp.desc()).all()

# Legacy compat
from pydantic import BaseModel

class BroadcastRequest(BaseModel):
    message: str
    location_name: str
    latitude: float = 0.0
    longitude: float = 0.0
    risk_level: str = "CRITICAL"

@app.post("/api/alerts/broadcast")
def broadcast_alert(req: BroadcastRequest, db: Session = Depends(get_db)):
    alert = Alert(
        location_name=req.location_name,
        latitude=req.latitude,
        longitude=req.longitude,
        risk_level=req.risk_level,
        probability=1.0,
        reason=req.message,
        data_source="GOV_BROADCAST"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

class LegacyPredictRequest(BaseModel):
    rainfall_mm_hr: float
    elevation_m: float
    slope_degree: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float
    rainfall_change: float
    
@app.post("/predict")
@app.post("/api/predict")
def predict_legacy(req: LegacyPredictRequest):
    return ml_service.predict(req.dict())

@app.get("/api/seed_dummy")
def seed_dummy_predictions(db: Session = Depends(get_db)):
    import random
    from datetime import datetime, timedelta, timezone
    
    locations = [
        {"name": "Dehradun", "lat": 30.3165, "lng": 78.0322, "district": "Dehradun"},
        {"name": "Rudraprayag", "lat": 30.2840, "lng": 78.9810, "district": "Rudraprayag"},
        {"name": "Chamoli", "lat": 30.4040, "lng": 79.3220, "district": "Chamoli"},
        {"name": "Pauri Garhwal", "lat": 30.1500, "lng": 78.7800, "district": "Pauri Garhwal"},
        {"name": "Uttarkashi", "lat": 30.7268, "lng": 78.4354, "district": "Uttarkashi"},
        {"name": "Haridwar", "lat": 29.9457, "lng": 78.1642, "district": "Haridwar"}
    ]
    
    risks = [
        ("CRITICAL", 0.85, 0.99, 150, 300),
        ("HIGH", 0.65, 0.84, 80, 149),
        ("MEDIUM", 0.35, 0.64, 40, 79),
        ("LOW", 0.05, 0.34, 5, 39)
    ]
    
    now = datetime.now(timezone.utc)
    
    for i in range(100):
        loc = random.choice(locations)
        risk_def = random.choices(risks, weights=[10, 20, 30, 40])[0]
        
        prob = random.uniform(risk_def[1], risk_def[2])
        rain_24h = random.uniform(risk_def[3], risk_def[4])
        
        timestamp = now - timedelta(minutes=random.randint(1, 1440))
        
        pred = Prediction(
            timestamp=timestamp,
            latitude=loc["lat"],
            longitude=loc["lng"],
            location_name=loc["name"],
            district=loc["district"],
            state="Uttarakhand",
            elevation_m=1000,
            slope_degree=15,
            rainfall_mm_hr=rain_24h / 24,
            rain_1h=rain_24h / 24,
            rain_3h=rain_24h / 8,
            rain_6h=rain_24h / 4,
            rain_12h=rain_24h / 2,
            rain_24h=rain_24h,
            rainfall_change=random.uniform(-5, 10),
            prediction=1 if prob > 0.5 else 0,
            flood_probability=prob,
            risk_level=risk_def[0],
            data_source="SYSTEM_SIMULATION"
        )
        db.add(pred)
        
    db.commit()
    return {"message": "Seeded 100 predictions"}

import os
from fastapi.staticfiles import StaticFiles
vanilla_frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(vanilla_frontend_dir):
    app.mount("/static-ui", StaticFiles(directory=vanilla_frontend_dir, html=True), name="static-ui")
