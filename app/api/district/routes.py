from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.database.dependencies import get_db
from app.models.district import District

router = APIRouter(prefix="/districts", tags=["Districts"])


@router.get("")
def get_districts(
    state: str | None = Query(default=None),
    search: str | None = Query(default=None),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    query = db.query(District)

    if state:
        query = query.filter(District.state_name.ilike(state))

    if search:
        query = query.filter(
            District.district_name.ilike(f"%{search}%")
        )

    districts = (
        query
        .order_by(District.state_name, District.district_name)
        .all()
    )

    return {
        "districts": [
            {
                "id": district.id,
                "state_code": district.state_code,
                "state_name": district.state_name,
                "district_code": district.district_code,
                "district_name": district.district_name,
                "district_name_local": district.district_name_local,
            }
            for district in districts
        ]
    }