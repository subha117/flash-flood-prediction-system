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
