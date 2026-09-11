from app.database.database import SessionLocal
from app.models.district import District
from app.models.location import Location


def link_locations_to_districts():
    db = SessionLocal()

    try:
        locations = db.query(Location).all()

        linked = 0

        for location in locations:
            district = (
                db.query(District)
                .filter(
                    District.state_name.ilike(location.state),
                    District.district_name.ilike(location.district),
                )
                .first()
            )

            if not district:
                print(
                    f"District not found: "
                    f"{location.state} - {location.district}"
                )
                continue

            location.district_id = district.id
            linked += 1

            print(
                f"Linked: {location.state} - "
                f"{location.district} -> "
                f"district ID {district.id}"
            )

        db.commit()

        print(f"Successfully linked {linked} locations.")

    finally:
        db.close()


if __name__ == "__main__":
    link_locations_to_districts()