import sqlite3
import random
from datetime import datetime, timedelta, timezone
import os

db_path = "flashflood.db"
if not os.path.exists(db_path):
    print("DB not found!")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

locations = [
    {"name": "Dehradun", "lat": 30.3165, "lng": 78.0322, "district": "Dehradun"},
    {"name": "Rudraprayag", "lat": 30.2840, "lng": 78.9810, "district": "Rudraprayag"},
    {"name": "Chamoli", "lat": 30.4040, "lng": 79.3220, "district": "Chamoli"},
    {"name": "Pauri Garhwal", "lat": 30.1500, "lng": 78.7800, "district": "Pauri Garhwal"},
    {"name": "Uttarkashi", "lat": 30.7268, "lng": 78.4354, "district": "Uttarkashi"},
    {"name": "Haridwar", "lat": 29.9457, "lng": 78.1642, "district": "Haridwar"},
    {"name": "Nainital", "lat": 29.3919, "lng": 79.4542, "district": "Nainital"},
    {"name": "Almora", "lat": 29.5892, "lng": 79.6467, "district": "Almora"}
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
    
    # SQLite datetime is expected as string in ISO format for SQLAlchemy
    timestamp = (now - timedelta(minutes=random.randint(1, 1440))).isoformat()
    
    c.execute("""
        INSERT INTO predictions (
            timestamp, latitude, longitude, location_name, district, state,
            elevation_m, slope_degree, rainfall_mm_hr, rain_1h, rain_3h, rain_6h, rain_12h, rain_24h,
            rainfall_change, prediction, flood_probability, risk_level, data_source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        timestamp, loc["lat"], loc["lng"], loc["name"], loc["district"], "Uttarakhand",
        1000, 15, rain_24h/24, rain_24h/24, rain_24h/8, rain_24h/4, rain_24h/2, rain_24h,
        random.uniform(-5, 10), 1 if prob > 0.5 else 0, prob, risk_def[0], "SIMULATED"
    ))

conn.commit()
conn.close()
print("Seeded via sqlite3 successfully.")
