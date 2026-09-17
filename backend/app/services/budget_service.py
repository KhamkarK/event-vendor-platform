from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.event_repository import EventRepository
from app.schemas.budget import BudgetAllocationUpdate, BudgetBulkReorderRequest, BudgetSummary


class BudgetService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)

    def get_summary(self, event_id: int, user_id: int) -> BudgetSummary:
        event = self._get_owned_event(event_id, user_id)
        allocations = self.events.list_allocations(event_id)
        total_allocated = sum(a.allocated_amount for a in allocations)
        total_spent = sum(a.spent_amount for a in allocations)
        return BudgetSummary(
            total_budget=event.total_budget,
            total_allocated=total_allocated,
            total_spent=total_spent,
            remaining=event.total_budget - total_allocated,
            is_over_budget=total_allocated > event.total_budget,
            categories=allocations,
        )

    def update_allocation(self, event_id: int, allocation_id: int, user_id: int, payload: BudgetAllocationUpdate):
        self._get_owned_event(event_id, user_id)
        allocation = self.events.get_allocation(allocation_id)
        if not allocation or allocation.event_id != event_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget category not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(allocation, field, value)
        self.events.commit()
        return allocation

    def bulk_reorder(self, event_id: int, user_id: int, payload: BudgetBulkReorderRequest):
        self._get_owned_event(event_id, user_id)
        allocations_by_id = {a.id: a for a in self.events.list_allocations(event_id)}
        for item in payload.allocations:
            allocation = allocations_by_id.get(item.id)
            if not allocation:
                continue
            allocation.sort_order = item.sort_order
            allocation.allocated_amount = item.allocated_amount
        self.events.commit()
        return self.events.list_allocations(event_id)

    def _get_owned_event(self, event_id: int, user_id: int):
        event = self.events.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event
