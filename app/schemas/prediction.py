from datetime import datetime
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    location_id: int = Field(..., ge=1)


class PredictionResponse(BaseModel):
    prediction: int
    flood_probability: float = Field(..., ge=0, le=1)
    risk_level: str
    location_id: int
    district: str
    state: str
    elevation_m: float
    slope_degree: float
    rainfall_mm_hr: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float


class PredictionHistoryResponse(BaseModel):
    id: int
    user_id: int
    location_id: int
    district: str | None = None
    state: str | None = None
    rainfall_mm_hr: float
    elevation_m: float
    slope_degree: float
    rain_1h: float
    rain_3h: float
    rain_6h: float
    rain_12h: float
    rain_24h: float
    rainfall_change: float
    prediction: int
    flood_probability: float
    risk_level: str
    created_at: datetime

    model_config = {"from_attributes": True}