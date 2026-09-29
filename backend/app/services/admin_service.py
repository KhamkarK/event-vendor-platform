from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token
from app.models.booking import Booking
from app.models.ledger import LedgerEntry
from app.models.user import User, UserRole, VendorProfile
from app.repositories.user_repository import UserRepository
from app.repositories.vendor_repository import VendorRepository
from app.schemas.auth import TokenResponse
from app.schemas.user import UserOut


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.vendors = VendorRepository(db)

    def list_pending_vendors(self) -> list[VendorProfile]:
        return self.users.list_pending_vendor_approvals()

    def list_all_vendors(self) -> list[VendorProfile]:
        return self.users.list_vendor_profiles(only_approved=False)

    def approve_vendor(self, vendor_id: int) -> VendorProfile:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        profile.is_approved = True
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def set_block_status(self, vendor_id: int, blocked: bool) -> VendorProfile:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        profile.is_blocked = blocked
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def set_commission_rate(self, vendor_id: int, rate: float) -> VendorProfile:
        if not (0 <= rate <= 100):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Commission rate must be between 0 and 100")
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        profile.commission_rate = rate
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def set_featured(self, vendor_id: int, featured: bool) -> VendorProfile:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        profile.is_featured = featured
        if featured:
            profile.featured_requested = False
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def list_customers(self) -> list[User]:
        return self.users.list_customers()

    def delete_customer(self, user_id: int) -> None:
        user = self.users.get_by_id(user_id)
        if not user or user.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        self.users.delete(user)

    def delete_vendor(self, vendor_id: int) -> None:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        # Deleting the underlying account (not just the profile row) so the
        # vendor is fully removed; the DB's ON DELETE CASCADE takes care of
        # the profile, packages, reviews, bookings, ledger entries, etc.
        self.users.delete(profile.user)

    def delete_review(self, review_id: int) -> None:
        review = self.vendors.get_review(review_id)
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        profile = review.vendor
        new_count = profile.rating_count - 1
        if new_count <= 0:
            profile.rating_avg = 0.0
            profile.rating_count = 0
        else:
            new_avg = ((profile.rating_avg * profile.rating_count) - review.rating) / new_count
            profile.rating_avg = round(new_avg, 2)
            profile.rating_count = new_count
        self.vendors.delete_review(review)

    def _issue_impersonation_tokens(self, user: User) -> TokenResponse:
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(subject=str(user.id))
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))

    def impersonate_customer(self, user_id: int) -> TokenResponse:
        user = self.users.get_by_id(user_id)
        if not user or user.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return self._issue_impersonation_tokens(user)

    def impersonate_vendor(self, vendor_id: int) -> TokenResponse:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        return self._issue_impersonation_tokens(profile.user)

    def set_customer_prime(self, user_id: int, prime: bool) -> User:
        user = self.users.get_by_id(user_id)
        if not user or user.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        user.is_prime = prime
        if prime:
            user.prime_requested = False
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_dashboard_stats(self) -> dict:
        total_users = self.db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.CUSTOMER)) or 0
        total_vendors = self.db.scalar(select(func.count()).select_from(VendorProfile)) or 0
        approved_vendors = (
            self.db.scalar(select(func.count()).select_from(VendorProfile).where(VendorProfile.is_approved.is_(True))) or 0
        )
        total_bookings = self.db.scalar(select(func.count()).select_from(Booking)) or 0
        total_commission_estimate = self.db.scalar(
            select(func.coalesce(func.sum(LedgerEntry.amount), 0.0)).where(LedgerEntry.entry_type == "credit")
        ) or 0.0

        return {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "approved_vendors": approved_vendors,
            "pending_vendors": total_vendors - approved_vendors,
            "total_bookings": total_bookings,
            "total_transacted_volume": float(total_commission_estimate),
        }
