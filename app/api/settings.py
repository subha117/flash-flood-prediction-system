from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.database import get_db
from app.core.auth import get_current_user_id
from app.models.user_settings import UserSettings

router = APIRouter(prefix="/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    default_location: Optional[str] = None
    units: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class SettingsResponse(BaseModel):
    theme: str
    default_location: Optional[str]
    units: str
    notifications_enabled: bool

    class Config:
        from_attributes = True

@router.get("", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=SettingsResponse)
def update_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
    
    update_data = settings_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
