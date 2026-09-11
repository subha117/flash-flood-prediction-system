with open("app/main.py", "r") as f:
    content = f.read()

endpoint_code = """
@app.get("/api/seed_dummy")
def seed_dummy_predictions(db: Session = Depends(get_db)):
    import random
    from datetime import datetime, timedelta, timezone
    
    locations = [
        {"name": "Dehradun", "lat": 30.3165, "lng": 78.0322, "district": "Dehradun"},
        {"name": "Rudraprayag", "lat": 30.2840, "lng": 78.9810, "district": "Rudraprayag"},
        {"name": "Chamoli", "lat": 30.4040, "lng": 79.3220, "district": "Chamoli"},
        {"name": "Pauri Garhwal", "lat": 30.1500, "lng": 78.7800, "district": "Pauri Garhwal"},
        {"name": "Uttarkashi", "lat": 30.7268, "lng": 78.4354, "district": "Uttarkashi"},
        {"name": "Haridwar", "lat": 29.9457, "lng": 78.1642, "district": "Haridwar"}
    ]
    
    risks = [
        ("CRITICAL", 0.85, 0.99, 150, 300),
        ("HIGH", 0.65, 0.84, 80, 149),
        ("MEDIUM", 0.35, 0.64, 40, 79),
        ("LOW", 0.05, 0.34, 5, 39)
    ]
    
    now = datetime.now(timezone.utc)
    
    for i in range(100):
        loc = random.choice(locations)
        risk_def = random.choices(risks, weights=[10, 20, 30, 40])[0]
        
        prob = random.uniform(risk_def[1], risk_def[2])
        rain_24h = random.uniform(risk_def[3], risk_def[4])
        
        timestamp = now - timedelta(minutes=random.randint(1, 1440))
        
        pred = Prediction(
            timestamp=timestamp,
            latitude=loc["lat"],
            longitude=loc["lng"],
            location_name=loc["name"],
            district=loc["district"],
            state="Uttarakhand",
            elevation_m=1000,
            slope_degree=15,
            rainfall_mm_hr=rain_24h / 24,
            rain_1h=rain_24h / 24,
            rain_3h=rain_24h / 8,
            rain_6h=rain_24h / 4,
            rain_12h=rain_24h / 2,
            rain_24h=rain_24h,
            rainfall_change=random.uniform(-5, 10),
            prediction=1 if prob > 0.5 else 0,
            flood_probability=prob,
            risk_level=risk_def[0],
            data_source="SYSTEM_SIMULATION"
        )
        db.add(pred)
        
    db.commit()
    return {"message": "Seeded 100 predictions"}
"""

if "def seed_dummy_predictions" not in content:
    content += endpoint_code
    with open("app/main.py", "w") as f:
        f.write(content)
