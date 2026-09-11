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
