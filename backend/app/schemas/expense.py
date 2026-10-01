from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    budget_allocation_id: int
    description: str = Field(min_length=1, max_length=255)
    amount: float = Field(gt=0)


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    budget_allocation_id: int
    # Denormalized read-only field (via model property), derived from the
    # linked budget allocation, so the expense list can show the category
    # name without a separate lookup.
    category_name: str | None = None
    description: str
    amount: float
    created_at: datetime


class ExpenseSummary(BaseModel):
    total_spent: float
    expenses: list[ExpenseOut]
