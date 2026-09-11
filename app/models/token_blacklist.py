from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.database import Base
from datetime import datetime, timezone

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    blacklisted_on: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
