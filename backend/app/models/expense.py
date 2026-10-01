"""Itemized per-event expense log (Prime customers only — see app/api/v1/expenses.py).

Each Expense is tied to one of the event's existing BudgetAllocation rows (the
"category head" the customer picks when logging it). Creating an Expense also
increments that allocation's spent_amount, so the existing Budget Allocator's
spent/remaining math (BudgetService.get_summary) stays the single source of
truth for "how much has been spent" rather than this being a second, separate
total.
"""
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    budget_allocation_id: Mapped[int] = mapped_column(
        ForeignKey("budget_allocations.id", ondelete="CASCADE"), nullable=False
    )

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    budget_allocation: Mapped["BudgetAllocation"] = relationship("BudgetAllocation")

    @property
    def category_name(self) -> str | None:
        """Read-only convenience field for ExpenseOut — the budget category this expense is logged under."""
        return self.budget_allocation.name if self.budget_allocation else None
