import rasterio
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ELEVATION_PATH = BASE_DIR / "data" / "dem" / "elevation.tif"
SLOPE_PATH = BASE_DIR / "data" / "dem" / "slope.tif"

def get_terrain_features(latitude: float, longitude: float):
    """
    Extracts elevation and slope for a given latitude and longitude.
    """
    if not ELEVATION_PATH.exists() or not SLOPE_PATH.exists():
        return {"error": "Terrain data files not found on server."}
        
    try:
        # Check elevation
        with rasterio.open(ELEVATION_PATH) as src_elev:
            # Check if point is within bounds
            if not (src_elev.bounds.left <= longitude <= src_elev.bounds.right and
                    src_elev.bounds.bottom <= latitude <= src_elev.bounds.top):
                return {"error": "Selected location is outside available terrain data coverage."}
                
            # Sample elevation
            for val in src_elev.sample([(longitude, latitude)]):
                elevation = float(val[0])
                break
                
        # Check slope
        with rasterio.open(SLOPE_PATH) as src_slope:
            for val in src_slope.sample([(longitude, latitude)]):
                slope = float(val[0])
                break
                
        return {
            "elevation_m": elevation,
            "slope_degree": slope
        }
        
    except Exception as e:
        return {"error": f"Error extracting terrain data: {str(e)}"}
