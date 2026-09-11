from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    __table_args__ = (
        Index(
            "ix_predictions_user_created_at",
            "user_id",
            "created_at",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False,
        index=True,
    )

    rainfall_mm_hr: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    elevation_m: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    slope_degree: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rain_1h: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rain_3h: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rain_6h: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rain_12h: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rain_24h: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    rainfall_change: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    prediction: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    flood_probability: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )