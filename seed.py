from app.database.database import SessionLocal
from app.models.location import Location
from app.models.district import District

def seed():
    db = SessionLocal()
    try:
        # Check if districts exist
        if db.query(District).count() == 0:
            districts = [
                District(state_code=1, state_name="Uttarakhand", district_code=101, district_name="Dehradun"),
                District(state_code=1, state_name="Uttarakhand", district_code=102, district_name="Tehri Garhwal"),
                District(state_code=1, state_name="Uttarakhand", district_code=103, district_name="Rudraprayag"),
                District(state_code=1, state_name="Uttarakhand", district_code=104, district_name="Chamoli"),
                District(state_code=1, state_name="Uttarakhand", district_code=105, district_name="Uttarkashi"),
            ]
            db.add_all(districts)
            db.commit()
            print("Seeded districts")

        if db.query(Location).count() == 0:
            d_dehradun = db.query(District).filter_by(district_name="Dehradun").first()
            d_tehri = db.query(District).filter_by(district_name="Tehri Garhwal").first()
            d_rudraprayag = db.query(District).filter_by(district_name="Rudraprayag").first()

            locations = [
                Location(district_id=d_tehri.id, district="Tehri Garhwal", state="Uttarakhand", latitude=30.3720, longitude=78.4920, elevation_m=1520, slope_degree=25),
                Location(district_id=d_rudraprayag.id, district="Rudraprayag", state="Uttarakhand", latitude=30.2850, longitude=78.9810, elevation_m=895, slope_degree=18),
                Location(district_id=d_dehradun.id, district="Dehradun", state="Uttarakhand", latitude=30.3165, longitude=78.0322, elevation_m=640, slope_degree=14),
            ]
            db.add_all(locations)
            db.commit()
            print("Seeded locations")

        from app.models.user import User
        if db.query(User).count() == 0:
            from app.core.security import hash_password
            user = User(name="Test User", email="test@test.com", password_hash=hash_password("password"))
            db.add(user)
            db.commit()
            print("Seeded user: test@test.com / password")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
