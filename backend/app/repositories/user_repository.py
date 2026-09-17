from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, VendorProfile


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_username(self, username: str) -> User | None:
        return self.db.scalar(select(User).where(User.username == username))

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email))

    def get_by_mobile(self, mobile: str) -> User | None:
        return self.db.scalar(select(User).where(User.mobile == mobile))

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_vendor_profile(self, profile: VendorProfile) -> VendorProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_vendor_profiles(
        self,
        *,
        category: str | None = None,
        location: str | None = None,
        min_rating: float | None = None,
        max_budget: float | None = None,
        only_approved: bool = True,
    ) -> list[VendorProfile]:
        stmt = select(VendorProfile)
        if only_approved:
            stmt = stmt.where(VendorProfile.is_approved.is_(True), VendorProfile.is_blocked.is_(False))
        if category:
            stmt = stmt.where(VendorProfile.category.ilike(f"%{category}%"))
        if location:
            stmt = stmt.where(VendorProfile.location.ilike(f"%{location}%"))
        if min_rating is not None:
            stmt = stmt.where(VendorProfile.rating_avg >= min_rating)
        return list(self.db.scalars(stmt))

    def get_vendor_profile(self, vendor_id: int) -> VendorProfile | None:
        return self.db.get(VendorProfile, vendor_id)

    def list_pending_vendor_approvals(self) -> list[VendorProfile]:
        return list(self.db.scalars(select(VendorProfile).where(VendorProfile.is_approved.is_(False))))
