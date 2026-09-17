from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import BudgetAllocation, BudgetCategory
from app.models.event import Event, EventType


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, event: Event) -> Event:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: int) -> Event | None:
        return self.db.get(Event, event_id)

    def list_by_user(self, user_id: int) -> list[Event]:
        return list(self.db.scalars(select(Event).where(Event.user_id == user_id).order_by(Event.event_date)))

    def update(self, event: Event) -> Event:
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: Event) -> None:
        self.db.delete(event)
        self.db.commit()

    # --- budget categories/allocations ---

    def get_category_templates(self, event_type: EventType) -> list[BudgetCategory]:
        return list(
            self.db.scalars(
                select(BudgetCategory).where(BudgetCategory.event_type == event_type).order_by(BudgetCategory.sort_order)
            )
        )

    def create_allocation(self, allocation: BudgetAllocation) -> BudgetAllocation:
        self.db.add(allocation)
        return allocation

    def list_allocations(self, event_id: int) -> list[BudgetAllocation]:
        return list(
            self.db.scalars(
                select(BudgetAllocation)
                .where(BudgetAllocation.event_id == event_id)
                .order_by(BudgetAllocation.sort_order)
            )
        )

    def get_allocation(self, allocation_id: int) -> BudgetAllocation | None:
        return self.db.get(BudgetAllocation, allocation_id)

    def commit(self) -> None:
        self.db.commit()
