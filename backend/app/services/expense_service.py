from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.repositories.event_repository import EventRepository
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseSummary


class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)
        self.expenses = ExpenseRepository(db)

    def list_expenses(self, event_id: int, user_id: int) -> ExpenseSummary:
        self._get_owned_event(event_id, user_id)
        expenses = self.expenses.list_by_event(event_id)
        return ExpenseSummary(total_spent=sum(e.amount for e in expenses), expenses=expenses)

    def create_expense(self, event_id: int, user_id: int, payload: ExpenseCreate) -> Expense:
        self._get_owned_event(event_id, user_id)
        allocation = self.events.get_allocation(payload.budget_allocation_id)
        if not allocation or allocation.event_id != event_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget category not found")

        expense = self.expenses.create(
            Expense(
                event_id=event_id,
                budget_allocation_id=payload.budget_allocation_id,
                description=payload.description,
                amount=payload.amount,
            )
        )
        allocation.spent_amount += payload.amount
        self.expenses.commit()
        self.db.refresh(expense)
        return expense

    def _get_owned_event(self, event_id: int, user_id: int):
        event = self.events.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event
