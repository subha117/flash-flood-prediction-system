import os
import rasterio
from typing import Tuple, Optional

DEM_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "dem")
ELEVATION_FILE = os.path.join(DEM_DIR, "elevation.tif")
SLOPE_FILE = os.path.join(DEM_DIR, "slope.tif")

def get_terrain_data(latitude: float, longitude: float) -> Tuple[Optional[float], Optional[float]]:
    """
    Extracts elevation and slope for a given coordinate.
    Returns (elevation_m, slope_degree).
    If out of bounds or missing files, returns (None, None).
    """
    elevation = None
    slope = None

    if not os.path.exists(ELEVATION_FILE) or not os.path.exists(SLOPE_FILE):
        return None, None

    try:
        with rasterio.open(ELEVATION_FILE) as el_src:
            # Check if out of bounds
            if not (el_src.bounds.left <= longitude <= el_src.bounds.right and
                    el_src.bounds.bottom <= latitude <= el_src.bounds.top):
                return None, None
            
            row, col = el_src.index(longitude, latitude)
            elevation = float(el_src.read(1)[row, col])
            
            # Handle nodata
            if el_src.nodata is not None and elevation == el_src.nodata:
                elevation = None

        with rasterio.open(SLOPE_FILE) as sl_src:
            if not (sl_src.bounds.left <= longitude <= sl_src.bounds.right and
                    sl_src.bounds.bottom <= latitude <= sl_src.bounds.top):
                return elevation, None
            
            row, col = sl_src.index(longitude, latitude)
            slope = float(sl_src.read(1)[row, col])
            
            if sl_src.nodata is not None and slope == sl_src.nodata:
                slope = None

    except Exception as e:
        # Graceful fallback on any rasterio error
        print(f"Error reading terrain data: {e}")
        return None, None

    return elevation, slope
