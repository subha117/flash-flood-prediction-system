from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    state_code: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    state_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    state_census2011_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    district_code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
        index=True,
    )

    district_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    district_name_local: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    district_census2011_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )