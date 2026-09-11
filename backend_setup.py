import os
import shutil

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')

# 1. Config & Environment
write_file("app/core/config.py", """
import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
# Fallback to sqlite if postgres is not provided in development
_default_db = "sqlite:///./flashflood.db" if ENVIRONMENT != "production" else ""
DATABASE_URL = os.getenv("DATABASE_URL", _default_db)
if not DATABASE_URL and ENVIRONMENT == "production":
    raise RuntimeError("DATABASE_URL must be set in production")

print(f"[*] Starting in {ENVIRONMENT} mode. DB: {DATABASE_URL}")

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
""")

# 2. Database Models (Predictions, Alerts)
write_file("app/models/prediction.py", """
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from app.database.database import Base

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, index=True)
    district = Column(String)
    state = Column(String)
    
    # ML Features
    rainfall_mm_hr = Column(Float)
    elevation_m = Column(Float, nullable=True)
    slope_degree = Column(Float, nullable=True)
    rain_1h = Column(Float)
    rain_3h = Column(Float)
    rain_6h = Column(Float)
    rain_12h = Column(Float)
    rain_24h = Column(Float)
    rainfall_change = Column(Float)
    
    # Results
    prediction = Column(Integer)
    flood_probability = Column(Float)
    risk_level = Column(String)
    data_source = Column(String)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    risk_level = Column(String)
    probability = Column(Float)
    reason = Column(String)
    data_source = Column(String)
    resolved = Column(Boolean, default=False)
""")

write_file("app/database/database.py", """
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""")

# 3. Schemas
write_file("app/schemas/prediction.py", """
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionCreate(BaseModel):
    latitude: float
    longitude: float
    location_name: str
    district: Optional[str] = None
    state: Optional[str] = None
    rainfall_mm_hr: float
    elevation_m: Optional[float] = None
    slope_degree: Optional[float] = None
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float
    rainfall_change: float
    prediction: int
    flood_probability: float
    risk_level: str
    data_source: str

class PredictionResponse(PredictionCreate):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class AlertResponse(BaseModel):
    id: int
    location_name: str
    latitude: float
    longitude: float
    timestamp: datetime
    risk_level: str
    probability: float
    reason: str
    data_source: str
    resolved: bool
    class Config:
        orm_mode = True
""")

# 4. ML Service
write_file("app/services/ml_service.py", """
import pickle
import os
import numpy as np

MODEL_FEATURES = [
    "rainfall_mm_hr",
    "elevation_m",
    "slope_degree",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rainfall_change"
]

class MLService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), "../../app/ml/model.pkl")
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), "../../ml/models/random_forest_flood.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            print(f"[*] ML model loaded from {model_path}")
        else:
            print("[!] Warning: ML model not found. Predictions will return dummy data.")

    def predict(self, features_dict: dict):
        if not self.model:
            return {"prediction": 0, "flood_probability": 0.1, "risk_level": "LOW"}
            
        # Ensure exact order and no NaNs
        input_vector = []
        for feat in MODEL_FEATURES:
            val = features_dict.get(feat)
            if val is None or np.isnan(val):
                raise ValueError(f"Missing or invalid feature: {feat}")
            input_vector.append(float(val))
            
        try:
            arr = np.array([input_vector])
            pred = int(self.model.predict(arr)[0])
            prob = float(self.model.predict_proba(arr)[0][1])
            
            # Risk Level
            if prob < 0.3:
                risk = "LOW"
            elif prob < 0.6:
                risk = "MEDIUM"
            elif prob < 0.8:
                risk = "HIGH"
            else:
                risk = "CRITICAL"
                
            return {
                "prediction": pred,
                "flood_probability": prob,
                "risk_level": risk
            }
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")

ml_service = MLService()
""")

print("Database, Schemas, and ML service scaffolding complete.")
