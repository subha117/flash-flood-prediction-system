from app.services.weather_service import get_rainfall_data


data = get_rainfall_data(
    latitude=26.491,
    longitude=89.527,
)

print("Rainfall data:")
print("1 hour :", data["rain_1h"], "mm")
print("3 hours:", data["rain_3h"], "mm")
print("6 hours:", data["rain_6h"], "mm")
print("12 hours:", data["rain_12h"], "mm")
print("24 hours:", data["rain_24h"], "mm")