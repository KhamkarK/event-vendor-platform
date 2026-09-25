from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_customer
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserOut, UserUpdate, VendorProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    return UserRepository(db).update(current_user)


@router.patch("/me/vendor-profile", response_model=UserOut)
def update_vendor_profile(payload: VendorProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.vendor_profile:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(current_user.vendor_profile, field, value)
        db.commit()
        db.refresh(current_user)
    return current_user


@router.post("/me/prime-request", response_model=UserOut)
def request_prime_membership(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    """Records that this customer asked for Prime membership — no payment is
    charged here; an admin still has to drag them into "Prime Members" on the
    Customers page (AdminService.set_customer_prime) to actually activate it."""
    current_user.prime_requested = True
    return UserRepository(db).update(current_user)
