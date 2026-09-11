from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database.database import get_db
from app.core.auth import get_current_user_id
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/activity", tags=["activity"])

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

def log_activity(db: Session, user_id: int, action: str, details: str = None):
    log_entry = ActivityLog(user_id=user_id, action=action, details=details)
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

@router.get("", response_model=List[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
    limit: int = 50
):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    return logs
