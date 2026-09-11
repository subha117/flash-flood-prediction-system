from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from app.database.database import get_db
from app.core.auth import get_current_user_id
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

def get_current_admin_user(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return user

@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    users = db.query(User).all()
    return users

@router.post("/backup")
def backup_system(
    admin: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    # Dummy implementation for backup
    return {"status": "success", "message": "Backup created successfully"}

@router.post("/restore")
def restore_system(
    admin: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    # Dummy implementation for restore
    return {"status": "success", "message": "System restored successfully"}
