"""Site-wide Gold and Silver rates, set manually by an admin (see
app/api/v1/metal_rates.py) and shown as a running strip on every page (see
frontend/src/components/layout/RateTicker.tsx).

A single row (id=1, seeded by its migration) rather than a history table —
MetalRateService always reads and writes that one row, so there's never a
"no row yet" case to handle beyond the two fields being nullable until the
admin first sets them.
"""
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MetalRate(Base):
    __tablename__ = "metal_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    gold_rate_per_10g: Mapped[float | None] = mapped_column(Float, nullable=True)
    silver_rate_per_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
