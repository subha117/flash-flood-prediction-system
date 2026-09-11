from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    theme: Mapped[str] = mapped_column(String(50), default="light", nullable=False)
    
    default_location: Mapped[str] = mapped_column(String(255), nullable=True)
    
    units: Mapped[str] = mapped_column(String(20), default="metric", nullable=False)
    
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
