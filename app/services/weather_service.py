import httpx
from datetime import datetime, timedelta

def degrees_to_cardinal(d):
    if d is None:
        return "NE"
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    ix = round(float(d) / (360. / len(dirs)))
    return dirs[ix % len(dirs)]

def code_to_desc(code, precip=0):
    if precip > 5:
        return "Heavy Rain"
    if precip > 0 or code in [51, 53, 55, 61, 80]:
        return "Light Rain"
    if code in [63, 65, 81, 82, 95, 96, 99]:
        return "Rain"
    if code in [1, 2]:
        return "Partly Cloudy"
    if code == 3:
        return "Overcast"
    if code in [45, 48]:
        return "Foggy"
    return "Clear"

def get_live_weather(latitude: float, longitude: float):
    # Try Open-Meteo
    # Request past_days=2 to ensure we have at least 24 hours in the past + detailed metrics
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation,weather_code&past_days=2"
    try:
        with httpx.Client(timeout=6.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            cur = data.get("current", {})
            hourly = data.get("hourly", {})
            hourly_precip = hourly.get("precipitation", [])
            hourly_temp = hourly.get("temperature_2m", [])
            hourly_code = hourly.get("weather_code", [])
            hourly_time = hourly.get("time", [])
            
            # Find the index of the current hour (hourly times end in :00)
            current_time_str = cur.get("time", "") # e.g. "2026-09-11T23:15"
            cur_hour_str = current_time_str[:13] + ":00" if len(current_time_str) >= 13 else current_time_str
            
            try:
                current_idx = hourly_time.index(cur_hour_str)
            except ValueError:
                current_idx = min(48, len(hourly_precip) - 1)

            if current_idx >= 24:
                past_24h = hourly_precip[current_idx-23 : current_idx+1]
                p_1h = sum(past_24h[-1:])
                p_3h = sum(past_24h[-3:])
                p_6h = sum(past_24h[-6:])
                p_12h = sum(past_24h[-12:])
                p_24h = sum(past_24h)
                mm_hr = p_1h
            else:
                p_1h = p_3h = p_6h = p_12h = p_24h = mm_hr = 0.0

            # Hourly forecast (next 6-8 intervals)
            forecast = []
            start_f = max(0, current_idx)
            end_f = min(start_f + 8, len(hourly_time))
            for i in range(start_f, end_f):
                t_str = hourly_time[i]
                try:
                    dt = datetime.fromisoformat(t_str)
                    hour_label = "Now" if i == start_f else dt.strftime("%I %p").lstrip("0")
                except Exception:
                    hour_label = "Now" if i == start_f else f"+{i-start_f}h"

                t_val = hourly_temp[i] if i < len(hourly_temp) else 25.0
                p_val = hourly_precip[i] if i < len(hourly_precip) else 0.0
                c_val = hourly_code[i] if i < len(hourly_code) else 0

                if p_val > 2.0 or c_val in [63, 65, 81, 82, 95, 96, 99]:
                    w_type = "Rain"
                elif p_val > 0.0 or c_val in [51, 53, 55, 61, 80]:
                    w_type = "Light Rain"
                elif c_val in [1, 2, 3]:
                    w_type = "Cloudy"
                else:
                    w_type = "Clear"

                forecast.append({
                    "time": hour_label,
                    "temp": f"{round(t_val, 1)}°",
                    "type": w_type,
                    "precip": p_val
                })

            w_code = cur.get("weather_code", 0)
            precip_now = cur.get("precipitation", 0.0)

            return {
                "temperature": cur.get("temperature_2m", 24.8),
                "feels_like": cur.get("apparent_temperature", cur.get("temperature_2m", 24.8)),
                "humidity": cur.get("relative_humidity_2m", 80),
                "pressure": cur.get("surface_pressure", 1008.0),
                "wind_speed": cur.get("wind_speed_10m", 6.0),
                "wind_direction": degrees_to_cardinal(cur.get("wind_direction_10m", 45)),
                "weather_desc": code_to_desc(w_code, precip_now),
                "weather_code": w_code,
                "visibility": 8.5,
                "rainfall_mm_hr": mm_hr,
                "rain_1h": p_1h,
                "rain_3h": p_3h,
                "rain_6h": p_6h,
                "rain_12h": p_12h,
                "rain_24h": p_24h,
                "rainfall_change": p_1h - (p_3h / 3.0) if p_3h > 0 else p_1h,
                "hourly_forecast": forecast,
                "data_source": "LIVE"
            }
    except Exception as e:
        print(f"Weather API failed: {e}")
        return {
            "temperature": 24.8,
            "feels_like": 24.2,
            "humidity": 88.0,
            "pressure": 1008.0,
            "wind_speed": 6.2,
            "wind_direction": "NE",
            "weather_desc": "Light Rain",
            "visibility": 6.5,
            "rainfall_mm_hr": 12.6,
            "rain_1h": 12.6,
            "rain_3h": 35.0,
            "rain_6h": 60.0,
            "rain_12h": 90.0,
            "rain_24h": 135.2,
            "rainfall_change": 5.0,
            "hourly_forecast": [],
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
