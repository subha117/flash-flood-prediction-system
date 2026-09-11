import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_rainfall_data(latitude: float, longitude: float) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "precipitation",
        "past_days": 1,
        "forecast_days": 1,
        "timezone": "auto",
    }

    response = httpx.get(
        OPEN_METEO_URL,
        params=params,
        timeout=15.0,
    )

    response.raise_for_status()

    data = response.json()

    precipitation = data["hourly"]["precipitation"]

    if not precipitation:
        raise ValueError("No precipitation data received")

    rain_1h = sum(precipitation[-1:])
    rain_3h = sum(precipitation[-3:])
    rain_6h = sum(precipitation[-6:])
    rain_12h = sum(precipitation[-12:])
    rain_24h = sum(precipitation[-24:])

    return {
        "rain_1h": rain_1h,
        "rain_3h": rain_3h,
        "rain_6h": rain_6h,
        "rain_12h": rain_12h,
        "rain_24h": rain_24h,
    }