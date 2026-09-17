"""Budget allocation system: category templates + per-event allocations.

`BudgetCategory` rows are a seeded template (keyed by event_type) used to
auto-generate an event's initial category set. `BudgetAllocation` rows are the
actual, editable per-event line items that the drag-and-drop UI mutates.
"""
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.event import EventType


class BudgetCategory(Base):
    """Template category, seeded per event type (e.g. Marriage -> Venue Booking)."""

    __tablename__ = "budget_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_type: Mapped[EventType] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="sparkles", nullable=False)
    default_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class BudgetAllocation(Base):
    """The actual per-event budget line item a user allocates via drag & drop."""

    __tablename__ = "budget_allocations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="sparkles", nullable=False)
    allocated_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    spent_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    event: Mapped["Event"] = relationship("Event", back_populates="budget_allocations")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="budget_category")
