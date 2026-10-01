from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.expense import Expense


class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, expense: Expense) -> Expense:
        self.db.add(expense)
        return expense

    def list_by_event(self, event_id: int) -> list[Expense]:
        return list(
            self.db.scalars(select(Expense).where(Expense.event_id == event_id).order_by(Expense.created_at.desc()))
        )

    def commit(self) -> None:
        self.db.commit()
