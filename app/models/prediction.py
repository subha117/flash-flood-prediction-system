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
