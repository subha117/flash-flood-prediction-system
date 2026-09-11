from pydantic import BaseModel
from typing import Optional

class LocationMetadata(BaseModel):
    latitude: float
    longitude: float

class PredictionRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rainfall_mm_hr: float
    elevation_m: float
    slope_degree: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float
    rainfall_change: float

class PredictionResponse(BaseModel):
    location: Optional[LocationMetadata] = None
    prediction: int
    flood_probability: float
    risk_level: str

class FeaturesResponse(BaseModel):
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    slope_degree: Optional[float] = None
    rainfall_mm_hr: Optional[float] = None
    rain_1h: Optional[float] = None
    rain_3h: Optional[float] = None
    rain_6h: Optional[float] = None
    rain_12h: Optional[float] = None
    rain_24h: Optional[float] = None
    rainfall_change: Optional[float] = None
    error: Optional[str] = None
