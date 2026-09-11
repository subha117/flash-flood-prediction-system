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
