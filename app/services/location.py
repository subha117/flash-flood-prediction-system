import httpx
from typing import Optional, Dict

def get_location_name(latitude: float, longitude: float) -> Dict[str, Optional[str]]:
    """
    Reverse geocodes using OpenStreetMap Nominatim.
    Returns dictionary with location_name, district, state.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "json",
        "zoom": 10,
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "FlashFloodPredictionApp/1.0"
    }

    try:
        response = httpx.get(url, params=params, headers=headers, timeout=5.0)
        response.raise_for_status()
        data = response.json()
        
        address = data.get("address", {})
        
        # Build location name
        city = address.get("city") or address.get("town") or address.get("village") or address.get("county") or ""
        state = address.get("state", "")
        district = address.get("state_district", address.get("county", ""))
        
        display_name = data.get("display_name", "Location name unavailable")
        # Simplify display name
        if city and state:
            location_name = f"{city}, {state}"
        else:
            location_name = display_name.split(",")[0] if display_name else "Location name unavailable"

        return {
            "location_name": location_name,
            "district": district,
            "state": state
        }
    except Exception as e:
        print(f"Error fetching location name: {e}")
        return {
            "location_name": "Location name unavailable",
            "district": None,
            "state": None
        }
