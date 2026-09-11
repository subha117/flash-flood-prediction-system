from pydantic import BaseModel, Field


class LocationResponse(BaseModel):
    id: int
    district: str
    state: str
    latitude: float
    longitude: float
    elevation_m: float
    slope_degree: float

    model_config = {"from_attributes": True}


class LocationListResponse(BaseModel):
    locations: list[LocationResponse]