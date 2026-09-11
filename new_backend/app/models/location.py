from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    district_id: Mapped[int] = mapped_column(
        ForeignKey("districts.id"),
        nullable=False,
        index=True,
    )

    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
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