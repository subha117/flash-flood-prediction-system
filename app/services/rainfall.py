import pandas as pd
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAINFALL_FEATURES_PATH = BASE_DIR / "data" / "rainfall" / "rainfall_features.csv"

# Cache the dataframe so we don't load it on every request
_rainfall_df = None

def load_rainfall_data():
    global _rainfall_df
    if _rainfall_df is None and RAINFALL_FEATURES_PATH.exists():
        # Load data, handle timestamps
        df = pd.read_csv(RAINFALL_FEATURES_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Sort by timestamp descending so the most recent is first
        df = df.sort_values(by='timestamp', ascending=False)
        _rainfall_df = df
    return _rainfall_df

def get_rainfall_features(latitude: float, longitude: float):
    """
    Extracts closest rainfall features for a given latitude and longitude.
    """
    df = load_rainfall_data()
    if df is None or df.empty:
        return {"error": "Rainfall data is not available on server."}
        
    try:
        # Simple Euclidean distance for closest point
        # (Assuming small lat/lon area, treating degrees as flat plane is acceptable for a prototype)
        df['distance'] = (df['latitude'] - latitude)**2 + (df['longitude'] - longitude)**2
        
        # We only want the most recent record for the closest location
        closest_loc = df.loc[df['distance'].idxmin()]
        
        # Check if the closest location is reasonably close (e.g., within 0.1 degrees, roughly 11km)
        if closest_loc['distance'] > 0.01:
             return {"error": "Selected location is too far from available rainfall data coverage."}

        return {
            "rainfall_mm_hr": float(closest_loc['rainfall_mm_hr']),
            "rain_1h": float(closest_loc['rain_1h']),
            "rain_3h": float(closest_loc['rain_3h']),
            "rain_6h": float(closest_loc['rain_6h']),
            "rain_12h": float(closest_loc['rain_12h']),
            "rain_24h": float(closest_loc['rain_24h']),
            "rainfall_change": float(closest_loc['rainfall_change'] if not pd.isna(closest_loc['rainfall_change']) else 0.0)
        }
    except Exception as e:
        return {"error": f"Error extracting rainfall data: {str(e)}"}
