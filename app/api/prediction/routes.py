from app.services.weather_service import get_rainfall_data
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.database.dependencies import get_db
from app.ml.model_loader import model
from app.models.location import Location
from app.models.prediction import Prediction
from app.schemas.prediction import (
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
)


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


@router.post(
    "/predict",
    response_model=PredictionResponse,
)
def predict(
    request: PredictionRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Get the selected location from the database
    location = (
        db.query(Location)
        .filter(Location.id == request.location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    # Get terrain parameters from the selected location
    elevation_m = location.elevation_m
    slope_degree = location.slope_degree

    # Get live rainfall data from Open-Meteo
    weather = get_rainfall_data(
        latitude=location.latitude,
        longitude=location.longitude,
    )

    rain_1h = weather["rain_1h"]
    rain_3h = weather["rain_3h"]
    rain_6h = weather["rain_6h"]
    rain_12h = weather["rain_12h"]
    rain_24h = weather["rain_24h"]

    # Current rainfall intensity
    rainfall_mm_hr = rain_1h

    # Calculate rainfall change
    rainfall_change = rain_1h - rain_3h / 3

    # Prepare the 9 features required by the ML model
    data = [[
        rainfall_mm_hr,
        elevation_m,    
        slope_degree,
        rain_1h,
        rain_3h,
        rain_6h,
        rain_12h,
        rain_24h,
        rainfall_change,
    ]]

    # Run ML model
    prediction = int(model.predict(data)[0])

    probability = float(
        model.predict_proba(data)[0][1]
    )

    # Determine flood risk level
    if probability >= 0.70:
        risk_level = "HIGH"
    elif probability >= 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Save prediction to database
    prediction_record = Prediction(
        user_id=current_user_id,
        location_id=request.location_id,
        rainfall_mm_hr=rainfall_mm_hr,
        elevation_m=elevation_m,
        slope_degree=slope_degree,
        rain_1h=rain_1h,
        rain_3h=rain_3h,
        rain_6h=rain_6h,
        rain_12h=rain_12h,
        rain_24h=rain_24h,
        rainfall_change=rainfall_change,
        prediction=prediction,
        flood_probability=probability,
        risk_level=risk_level,
    )

    db.add(prediction_record)
    db.commit()

    return PredictionResponse(
        prediction=prediction,
        flood_probability=probability,
        risk_level=risk_level,
        location_id=location.id,
        district=location.district,
        state=location.state,
        elevation_m=elevation_m,
        slope_degree=slope_degree,
        rainfall_mm_hr=rainfall_mm_hr,
        rain_1h=rain_1h,
        rain_3h=rain_3h,
        rain_6h=rain_6h,
        rain_12h=rain_12h,
        rain_24h=rain_24h,
    )


@router.get(
    "/history",
    response_model=list[PredictionHistoryResponse],
)
def prediction_history(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=50,
    ),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(Prediction, Location)
        .join(Location, Prediction.location_id == Location.id)
        .filter(Prediction.user_id == current_user_id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        PredictionHistoryResponse(
            id=prediction.id,
            user_id=prediction.user_id,
            location_id=prediction.location_id,
            district=location.district,
            state=location.state,
            rainfall_mm_hr=prediction.rainfall_mm_hr,
            elevation_m=prediction.elevation_m,
            slope_degree=prediction.slope_degree,
            rain_1h=prediction.rain_1h,
            rain_3h=prediction.rain_3h,
            rain_6h=prediction.rain_6h,
            rain_12h=prediction.rain_12h,
            rain_24h=prediction.rain_24h,
            rainfall_change=prediction.rainfall_change,
            prediction=prediction.prediction,
            flood_probability=prediction.flood_probability,
            risk_level=prediction.risk_level,
            created_at=prediction.created_at,
        )
        for prediction, location in predictions
    ]