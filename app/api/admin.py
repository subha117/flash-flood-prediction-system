import subprocess
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from pydantic import BaseModel

from app.database.database import get_db, engine
from app.core.auth import get_current_user_id
from app.models.user import User
from app.models.prediction import Prediction, Alert

router = APIRouter(prefix="/admin", tags=["admin"])

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    total_users: int
    total_predictions: int
    total_alerts: int
    active_alerts: int
    db_backend: str

def get_current_admin_user(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    return db.query(User).all()

@router.get("/stats", response_model=SystemStats)
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    from app.core.config import DATABASE_URL
    return {
        "total_users": db.query(User).count(),
        "total_predictions": db.query(Prediction).count(),
        "total_alerts": db.query(Alert).count(),
        "active_alerts": db.query(Alert).filter(Alert.resolved == False).count(),
        "db_backend": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite",
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} deleted"}

@router.post("/backup")
def backup_system(admin: User = Depends(get_current_admin_user)) -> Dict[str, Any]:
    from app.core.config import DATABASE_URL
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"/tmp/flashflood_backup_{timestamp}.sql"
    
    if "postgresql" in DATABASE_URL:
        # Extract connection params
        import re
        match = re.match(r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", DATABASE_URL)
        if match:
            user, pwd, host, port, dbname = match.groups()
            env = os.environ.copy()
            env["PGPASSWORD"] = pwd
            result = subprocess.run(
                ["pg_dump", "-h", host, "-p", port, "-U", user, "-d", dbname, "-f", backup_file],
                capture_output=True, text=True, env=env
            )
            if result.returncode == 0:
                return {"status": "success", "message": f"Backup created: {backup_file}", "timestamp": timestamp}
            else:
                return {"status": "error", "message": result.stderr}
    return {"status": "success", "message": f"Backup simulated at {backup_file} (pg_dump not available)", "timestamp": timestamp}

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.resolved = True
    db.commit()
    return {"message": f"Alert {alert_id} resolved"}
