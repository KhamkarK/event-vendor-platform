from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.budget import (
    BudgetAllocationOut,
    BudgetAllocationUpdate,
    BudgetBulkReorderRequest,
    BudgetSummary,
)
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/events/{event_id}/budget", tags=["budget"])


@router.get("", response_model=BudgetSummary)
def get_budget_summary(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BudgetService(db).get_summary(event_id, current_user.id)


@router.patch("/{allocation_id}", response_model=BudgetAllocationOut)
def update_allocation(
    event_id: int,
    allocation_id: int,
    payload: BudgetAllocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return BudgetService(db).update_allocation(event_id, allocation_id, current_user.id, payload)


@router.post("/reorder", response_model=list[BudgetAllocationOut])
def reorder_allocations(
    event_id: int,
    payload: BudgetBulkReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return BudgetService(db).bulk_reorder(event_id, current_user.id, payload)
