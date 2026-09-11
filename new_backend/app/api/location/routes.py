from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.database.dependencies import get_db
from app.models.location import Location
from app.schemas.location import LocationListResponse, LocationResponse

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=LocationListResponse)
def get_locations(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    query = db.query(Location)

    if state:
        query = query.filter(Location.state.ilike(state))

    if district:
        query = query.filter(Location.district.ilike(district))

    locations = query.order_by(Location.state, Location.district).all()

    return LocationListResponse(locations=locations)