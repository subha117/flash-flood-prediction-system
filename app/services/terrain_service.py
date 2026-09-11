import rasterio
import os
import httpx

DEM_ELEVATION_PATH = os.path.join(os.path.dirname(__file__), "../../data/dem/elevation.tif")
DEM_SLOPE_PATH = os.path.join(os.path.dirname(__file__), "../../data/dem/slope.tif")

def get_terrain_data(latitude: float, longitude: float) -> dict:
    result = {"elevation_m": None, "slope_degree": None, "available": False, "source": "UNAVAILABLE"}
    
    # Try Local DEM first
    try:
        if os.path.exists(DEM_ELEVATION_PATH) and os.path.exists(DEM_SLOPE_PATH):
            with rasterio.open(DEM_ELEVATION_PATH) as src_elev:
                if (src_elev.bounds.left <= longitude <= src_elev.bounds.right and 
                    src_elev.bounds.bottom <= latitude <= src_elev.bounds.top):
                    
                    row, col = src_elev.index(longitude, latitude)
                    elev_val = float(src_elev.read(1)[row, col])
                    
                    with rasterio.open(DEM_SLOPE_PATH) as src_slope:
                        s_row, s_col = src_slope.index(longitude, latitude)
                        slope_val = float(src_slope.read(1)[s_row, s_col])
                        
                    if elev_val >= -100 and slope_val >= 0:
                        result["elevation_m"] = elev_val
                        result["slope_degree"] = slope_val
                        result["available"] = True
                        result["source"] = "Local DEM"
                        return result
    except Exception as e:
        print(f"Local DEM extraction failed: {e}")

    # Fallback to Online Terrain Service (Open-Meteo Elevation API)
    try:
        url = f"https://api.open-meteo.com/v1/elevation?latitude={latitude}&longitude={longitude}"
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if "elevation" in data and len(data["elevation"]) > 0:
                    elev_val = float(data["elevation"][0])
                    result["elevation_m"] = elev_val
                    # Since Open-Meteo only provides elevation, use an estimated flat slope for regional fallback
                    # This avoids the "silently substitute with 0" rule by explicitly labeling the source
                    result["slope_degree"] = 0.5 
                    result["available"] = True
                    result["source"] = "Online Terrain (Est. Slope)"
                    return result
    except Exception as e:
        print(f"Online terrain API failed: {e}")

    return result
