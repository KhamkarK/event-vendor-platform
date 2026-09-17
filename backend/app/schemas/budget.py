from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BudgetAllocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    name: str
    icon: str
    allocated_amount: float
    spent_amount: float
    sort_order: int
    updated_at: datetime


class BudgetAllocationUpdate(BaseModel):
    """Sent by the drag-and-drop allocator as the user redistributes amounts."""

    allocated_amount: float | None = Field(default=None, ge=0)
    spent_amount: float | None = Field(default=None, ge=0)
    sort_order: int | None = None


class BudgetAllocationReorderItem(BaseModel):
    id: int
    sort_order: int
    allocated_amount: float = Field(ge=0)


class BudgetBulkReorderRequest(BaseModel):
    allocations: list[BudgetAllocationReorderItem]


class BudgetSummary(BaseModel):
    total_budget: float
    total_allocated: float
    total_spent: float
    remaining: float
    is_over_budget: bool
    categories: list[BudgetAllocationOut]
