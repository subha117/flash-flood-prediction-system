import os
import httpx
from datetime import datetime, timedelta
import random

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

def get_rainfall_data(latitude: float, longitude: float) -> dict:
    """
    Fetches current weather and recent rainfall data.
    If WEATHER_API_KEY is not set, it acts as a fallback using dataset/demo mode.
    """
    if not WEATHER_API_KEY:
        # Fallback to Dataset / Demo Data mode
        return _get_demo_rainfall_data(latitude, longitude)
    
    # Live data mode
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m",
        "past_days": 1,
        "forecast_days": 1,
        "timezone": "auto",
    }
    try:
        response = httpx.get(OPEN_METEO_URL, params=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()

        precipitation = data["hourly"]["precipitation"]
        
        # Current conditions
        # Simplistic way to get the latest available hour
        temperature = data["hourly"]["temperature_2m"][-1] if data["hourly"].get("temperature_2m") else 25.0
        humidity = data["hourly"]["relative_humidity_2m"][-1] if data["hourly"].get("relative_humidity_2m") else 80.0
        wind_speed = data["hourly"]["wind_speed_10m"][-1] if data["hourly"].get("wind_speed_10m") else 10.0
        
        rain_1h = sum(precipitation[-1:]) if precipitation else 0.0
        rain_3h = sum(precipitation[-3:]) if len(precipitation) >= 3 else rain_1h
        rain_6h = sum(precipitation[-6:]) if len(precipitation) >= 6 else rain_3h
        rain_12h = sum(precipitation[-12:]) if len(precipitation) >= 12 else rain_6h
        rain_24h = sum(precipitation[-24:]) if len(precipitation) >= 24 else rain_12h
        
        return {
            "rain_1h": rain_1h,
            "rain_3h": rain_3h,
            "rain_6h": rain_6h,
            "rain_12h": rain_12h,
            "rain_24h": rain_24h,
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "data_source": "Live Weather API"
        }
    except Exception as e:
        print(f"Error fetching live weather: {e}")
        return _get_demo_rainfall_data(latitude, longitude)

def get_rainfall_history(latitude: float, longitude: float) -> dict:
    """
    Fetches 7 days of rainfall history.
    """
    if not WEATHER_API_KEY:
        return _get_demo_rainfall_history(latitude, longitude)
        
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "precipitation_sum",
        "past_days": 7,
        "forecast_days": 0,
        "timezone": "auto",
    }
    
    try:
        response = httpx.get(OPEN_METEO_URL, params=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        
        dates = data["daily"]["time"]
        rainfalls = data["daily"]["precipitation_sum"]
        
        history = [{"date": d, "rainfall": r if r is not None else 0.0} for d, r in zip(dates, rainfalls)]
        return {"history": history, "data_source": "Live Weather API"}
    except Exception as e:
        print(f"Error fetching live weather history: {e}")
        return _get_demo_rainfall_history(latitude, longitude)


def _get_demo_rainfall_data(latitude: float, longitude: float) -> dict:
    """
    Generates realistic looking demo dataset for given coordinates.
    Specifically makes it look severe if it's Kolkata for demo purposes, 
    otherwise returns a base line.
    """
    # Demo logic based on coordinates
    is_kolkata = (22.0 <= latitude <= 23.0) and (88.0 <= longitude <= 89.0)
    
    if is_kolkata:
        return {
            "rain_1h": 33.32,
            "rain_3h": 54.52,
            "rain_6h": 79.10,
            "rain_12h": 80.88,
            "rain_24h": 87.20,
            "temperature": 29.5,
            "humidity": 88.0,
            "wind_speed": 18.5,
            "data_source": "Dataset / Demo Data"
        }
    else:
        # Some generic data
        base_rain = random.uniform(0, 5)
        return {
            "rain_1h": base_rain,
            "rain_3h": base_rain * 2,
            "rain_6h": base_rain * 3.5,
            "rain_12h": base_rain * 5,
            "rain_24h": base_rain * 7.5,
            "temperature": random.uniform(20, 35),
            "humidity": random.uniform(50, 95),
            "wind_speed": random.uniform(5, 25),
            "data_source": "Dataset / Demo Data"
        }

def _get_demo_rainfall_history(latitude: float, longitude: float) -> dict:
    is_kolkata = (22.0 <= latitude <= 23.0) and (88.0 <= longitude <= 89.0)
    
    today = datetime.now()
    history = []
    
    for i in range(7):
        date_str = (today - timedelta(days=(6-i))).strftime("%Y-%m-%d")
        if is_kolkata:
            # Simulate a rising trend for Kolkata demo
            rain = [10.5, 12.0, 18.4, 31.8, 42.3, 65.2, 87.2][i]
        else:
            rain = random.uniform(0, 15)
        history.append({"date": date_str, "rainfall": rain})
        
    return {"history": history, "data_source": "Dataset / Demo Data"}