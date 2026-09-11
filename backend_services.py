import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')

write_file("app/services/weather_service.py", """
import httpx
from datetime import datetime, timedelta

def get_live_weather(latitude: float, longitude: float):
    # Try Open-Meteo
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation&past_days=7"
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            cur = data.get("current", {})
            hourly_precip = data.get("hourly", {}).get("precipitation", [])
            
            if len(hourly_precip) >= 24:
                # Calculate features
                p_1h = sum(hourly_precip[-1:])
                p_3h = sum(hourly_precip[-3:])
                p_6h = sum(hourly_precip[-6:])
                p_12h = sum(hourly_precip[-12:])
                p_24h = sum(hourly_precip[-24:])
                mm_hr = p_1h
            else:
                p_1h = p_3h = p_6h = p_12h = p_24h = mm_hr = 0.0

            return {
                "temperature": cur.get("temperature_2m", 0.0),
                "humidity": cur.get("relative_humidity_2m", 0.0),
                "wind_speed": cur.get("wind_speed_10m", 0.0),
                "rainfall_mm_hr": mm_hr,
                "rain_1h": p_1h,
                "rain_3h": p_3h,
                "rain_6h": p_6h,
                "rain_12h": p_12h,
                "rain_24h": p_24h,
                "rainfall_change": p_1h - (p_3h / 3.0) if p_3h > 0 else p_1h,
                "data_source": "LIVE"
            }
    except Exception as e:
        print(f"Weather API failed: {e}")
        return {
            "temperature": 28.5,
            "humidity": 80.0,
            "wind_speed": 12.0,
            "rainfall_mm_hr": 45.2,
            "rain_1h": 45.2,
            "rain_3h": 120.5,
            "rain_6h": 210.0,
            "rain_12h": 340.0,
            "rain_24h": 450.0,
            "rainfall_change": 15.0,
            "data_source": "DEMO"
        }

def get_rainfall_history(latitude: float, longitude: float):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&daily=precipitation_sum&past_days=7"
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            daily = data.get("daily", {})
            times = daily.get("time", [])
            precips = daily.get("precipitation_sum", [])
            history = []
            for t, p in zip(times, precips):
                history.append({"date": t, "rainfall": p})
            return {"history": history, "data_source": "LIVE"}
    except Exception as e:
        print(f"Weather History API failed: {e}")
        # Demo fallback
        dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7, 0, -1)]
        return {
            "history": [{"date": d, "rainfall": 20 + i*15} for i, d in enumerate(dates)],
            "data_source": "DATASET"
        }
""")

write_file("app/services/terrain_service.py", """
import rasterio
import os

DEM_ELEVATION_PATH = os.path.join(os.path.dirname(__file__), "../../data/dem/elevation.tif")
DEM_SLOPE_PATH = os.path.join(os.path.dirname(__file__), "../../data/dem/slope.tif")

def get_terrain_data(latitude: float, longitude: float) -> dict:
    result = {"elevation_m": None, "slope_degree": None, "available": False, "source": "UNAVAILABLE"}
    
    if not os.path.exists(DEM_ELEVATION_PATH) or not os.path.exists(DEM_SLOPE_PATH):
        return result
        
    try:
        with rasterio.open(DEM_ELEVATION_PATH) as src_elev:
            if not (src_elev.bounds.left <= longitude <= src_elev.bounds.right and src_elev.bounds.bottom <= latitude <= src_elev.bounds.top):
                return result # Out of bounds
                
            row, col = src_elev.index(longitude, latitude)
            elev_val = float(src_elev.read(1)[row, col])
            
        with rasterio.open(DEM_SLOPE_PATH) as src_slope:
            row, col = src_slope.index(longitude, latitude)
            slope_val = float(src_slope.read(1)[row, col])
            
        if elev_val < -100 or slope_val < 0:
            return result # Invalid NoData
            
        result["elevation_m"] = elev_val
        result["slope_degree"] = slope_val
        result["available"] = True
        result["source"] = "DEM"
        
    except Exception as e:
        print(f"Terrain extraction failed: {e}")
        
    return result
""")

write_file("app/services/location_service.py", """
import httpx

def reverse_geocode(latitude: float, longitude: float):
    url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
    headers = {"User-Agent": "FlashFloodMonitoringApp/1.0"}
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                address = data.get("address", {})
                city = address.get("city") or address.get("town") or address.get("village") or "Unknown"
                district = address.get("state_district") or address.get("county") or "Unknown"
                state = address.get("state", "Unknown")
                country = address.get("country", "Unknown")
                name = data.get("name") or city
                
                return {
                    "name": name,
                    "city": city,
                    "district": district,
                    "state": state,
                    "country": country,
                    "latitude": latitude,
                    "longitude": longitude
                }
    except Exception as e:
        print(f"Reverse geocode failed: {e}")
        
    return {
        "name": f"{latitude:.4f}, {longitude:.4f}",
        "city": "Unknown",
        "district": "Unknown",
        "state": "Unknown",
        "country": "Unknown",
        "latitude": latitude,
        "longitude": longitude
    }

def search_location(query: str):
    url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5"
    headers = {"User-Agent": "FlashFloodMonitoringApp/1.0"}
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                results = []
                for item in resp.json():
                    results.append({
                        "name": item.get("display_name", "").split(",")[0],
                        "full_name": item.get("display_name", ""),
                        "latitude": float(item.get("lat", 0)),
                        "longitude": float(item.get("lon", 0))
                    })
                return results
    except Exception as e:
        print(f"Search failed: {e}")
    return []
""")
print("Backend services scaffolded.")
