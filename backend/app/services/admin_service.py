from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.ledger import LedgerEntry
from app.models.user import User, UserRole, VendorProfile
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

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
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def list_customers(self) -> list[User]:
        return self.users.list_customers()

    def set_customer_prime(self, user_id: int, prime: bool) -> User:
        user = self.users.get_by_id(user_id)
        if not user or user.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        user.is_prime = prime
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
