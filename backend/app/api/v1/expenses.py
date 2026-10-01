from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_customer
from app.db.session import get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseSummary
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/events/{event_id}/expenses", tags=["expenses"])


def require_prime_customer(current_user: User = Depends(require_customer)) -> User:
    """Expense tracking is a Prime-only feature (see frontend/src/features/expenses/ExpensesPage.tsx
    for the matching customer-facing upsell when this is not satisfied)."""
    if not current_user.is_prime:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Prime membership required")
    return current_user


@router.get("", response_model=ExpenseSummary)
def list_expenses(event_id: int, current_user: User = Depends(require_prime_customer), db: Session = Depends(get_db)):
    return ExpenseService(db).list_expenses(event_id, current_user.id)


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    event_id: int,
    payload: ExpenseCreate,
    current_user: User = Depends(require_prime_customer),
    db: Session = Depends(get_db),
):
    return ExpenseService(db).create_expense(event_id, current_user.id, payload)
