import httpx
from datetime import datetime, timedelta

def get_live_weather(latitude: float, longitude: float):
    # Try Open-Meteo
    # Request past_days=2 to ensure we have at least 24 hours in the past
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation&past_days=2"
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            cur = data.get("current", {})
            hourly_precip = data.get("hourly", {}).get("precipitation", [])
            hourly_time = data.get("hourly", {}).get("time", [])
            
            # Find the index of the current hour
            current_time_str = cur.get("time") # e.g. "2023-10-25T14:00"
            
            try:
                current_idx = hourly_time.index(current_time_str)
            except ValueError:
                # Fallback if exact time string not found
                current_idx = len(hourly_precip) - 1

            if current_idx >= 24:
                # Calculate features using the past 24 hours up to the current hour
                past_24h = hourly_precip[current_idx-23 : current_idx+1]
                p_1h = sum(past_24h[-1:])
                p_3h = sum(past_24h[-3:])
                p_6h = sum(past_24h[-6:])
                p_12h = sum(past_24h[-12:])
                p_24h = sum(past_24h)
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
            
            # The API returns past days + current day + forecast.
            # We want exactly the 7 days ending today (or the most recent 7 past days).
            import datetime as dt
            today_str = dt.datetime.utcnow().strftime("%Y-%m-%d")
            
            for t, p in zip(times, precips):
                history.append({"date": t, "rainfall": p})
                
            # Filter to dates <= today, then take last 7
            history = [h for h in history if h["date"] <= today_str]
            history = history[-7:]
            
            return {"history": history, "data_source": "LIVE"}
    except Exception as e:
        print(f"Weather History API failed: {e}")
        # Demo fallback
        dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7, 0, -1)]
        return {
            "history": [{"date": d, "rainfall": 20 + i*15} for i, d in enumerate(dates)],
            "data_source": "DATASET"
        }
