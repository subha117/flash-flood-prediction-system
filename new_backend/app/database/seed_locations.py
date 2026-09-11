from app.database.database import SessionLocal
from app.models.location import Location


locations = [
    Location(
        district="Darjeeling",
        state="West Bengal",
        latitude=27.0360,
        longitude=88.2627,
        elevation_m=2050,
        slope_degree=25,
    ),
    Location(
        district="Kalimpong",
        state="West Bengal",
        latitude=27.0660,
        longitude=88.4750,
        elevation_m=1250,
        slope_degree=18,
    ),
    Location(
        district="Jalpaiguri",
        state="West Bengal",
        latitude=26.5167,
        longitude=88.7333,
        elevation_m=89,
        slope_degree=3,
    ),
    Location(
        district="Alipurduar",
        state="West Bengal",
        latitude=26.4910,
        longitude=89.5270,
        elevation_m=100,
        slope_degree=4,
    ),
    Location(
        district="Cooch Behar",
        state="West Bengal",
        latitude=26.3452,
        longitude=89.4482,
        elevation_m=45,
        slope_degree=2,
    ),
]


def seed_locations():
    db = SessionLocal()

    try:
        existing_count = db.query(Location).count()

        if existing_count > 0:
            print("Locations already exist. No new data inserted.")
            return

        db.add_all(locations)
        db.commit()

        print(f"Inserted {len(locations)} locations.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_locations()