import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')

write_file("app/main.py", """
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import engine, Base, get_db
from app.models.prediction import Prediction, Alert
from app.schemas.prediction import PredictionCreate, PredictionResponse, AlertResponse
from app.services.ml_service import ml_service
from app.services.weather_service import get_live_weather, get_rainfall_history
from app.services.terrain_service import get_terrain_data
from app.services.location_service import reverse_geocode, search_location

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

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/location")
def get_location(latitude: float, longitude: float):
    return reverse_geocode(latitude, longitude)

@app.get("/api/locations/search")
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
    db_pred = Prediction(**pred.dict())
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
    return db.query(Prediction).order_by(Prediction.timestamp.desc()).limit(50).all()

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.resolved == False).order_by(Alert.timestamp.desc()).all()

# Legacy compat
from pydantic import BaseModel
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
def predict_legacy(req: LegacyPredictRequest):
    return ml_service.predict(req.dict())
""")
print("API endpoints scaffolded.")
