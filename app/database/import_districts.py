from pathlib import Path

import pandas as pd

from app.database.base import Base
from app.database.database import SessionLocal, engine
from app.models.district import District


CSV_PATH = Path(__file__).resolve().parents[2] / "data" / "india_districts.csv"


def import_districts():
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"District CSV not found at: {CSV_PATH}"
        )

    # Create the districts table if it does not exist.
    Base.metadata.create_all(bind=engine)

    df = pd.read_csv(CSV_PATH)

    required_columns = [
        "state_code",
        "state_name_english",
        "state_census2011_code",
        "district_code",
        "district_name_english",
        "district_name_local",
        "district_census2011_code",
    ]

    missing = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing CSV columns: {', '.join(missing)}"
        )

    db = SessionLocal()

    try:
        existing_codes = {
            row[0]
            for row in db.query(District.district_code).all()
        }

        new_districts = []

        for _, row in df.iterrows():
            district_code = int(row["district_code"])

            if district_code in existing_codes:
                continue

            state_census = row["state_census2011_code"]
            district_census = row["district_census2011_code"]

            new_districts.append(
                District(
                    state_code=int(row["state_code"]),
                    state_name=str(row["state_name_english"]).strip(),
                    state_census2011_code=(
                        int(state_census)
                        if pd.notna(state_census)
                        else None
                    ),
                    district_code=district_code,
                    district_name=str(
                        row["district_name_english"]
                    ).strip(),
                    district_name_local=(
                        str(row["district_name_local"]).strip()
                        if pd.notna(row["district_name_local"])
                        else None
                    ),
                    district_census2011_code=(
                        int(district_census)
                        if pd.notna(district_census)
                        else None
                    ),
                )
            )

        if new_districts:
            db.add_all(new_districts)
            db.commit()

        print(
            f"Imported {len(new_districts)} new districts."
        )

    finally:
        db.close()


if __name__ == "__main__":
    import_districts()