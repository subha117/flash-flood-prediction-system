import asyncio
from app.services.location_service import search_location, reverse_geocode
from app.services.weather_service import get_live_weather
from app.services.terrain_service import get_terrain_data
from app.services.ml_service import ml_service
from app.database.database import Base, engine, SessionLocal
from app.models.prediction import Prediction
from datetime import datetime

print("Testing backend logic directly...")
# Test DB
Base.metadata.create_all(bind=engine)

# Test Geocode
print(search_location("Kolkata"))
print(reverse_geocode(22.57, 88.36))

# Test Weather
weather = get_live_weather(22.57, 88.36)
print(weather)

# Test ML Baseline
baseline = {
    "rainfall_mm_hr": 36.02,
    "elevation_m": 1755.0,
    "slope_degree": 40.387,
    "rain_1h": 33.32,
    "rain_3h": 54.51,
    "rain_6h": 79.09,
    "rain_12h": 80.87,
    "rain_24h": 87.20,
    "rainfall_change": 5.40
}
res = ml_service.predict(baseline)
print("Baseline prediction:", res)

# Write to DB
db = SessionLocal()
p = Prediction(
    latitude=22.57,
    longitude=88.36,
    location_name="Kolkata",
    prediction=res["prediction"],
    flood_probability=res["flood_probability"],
    risk_level=res["risk_level"],
    rainfall_mm_hr=36.02,
    rain_1h=33.32,
    rain_3h=54.51,
    rain_6h=79.09,
    rain_12h=80.87,
    rain_24h=87.20,
    rainfall_change=5.40
)
db.add(p)
db.commit()
print("Prediction saved to DB.")
