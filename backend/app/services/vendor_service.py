from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import UserRole
from app.models.vendor import VendorBlockedDate, VendorPackage, VendorReview
from app.repositories.booking_repository import BookingRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vendor_repository import VendorRepository
from app.schemas.vendor import (
    VendorBlockedDateCreate,
    VendorDetailOut,
    VendorPackageCreate,
    VendorPackageUpdate,
    VendorReviewCreate,
)

# Non-Prime customers only ever see vendors in these categories, capped to
# FREE_TIER_RESULT_LIMIT results per search — Prime customers see everything.
# Must exactly match entries in frontend/src/constants/vendorCategories.ts.
FREE_TIER_CATEGORIES = [
    "Marriage hall and Banquet Hall",
    "Food / Chef",
    "Photography and Videography Services",
]
FREE_TIER_RESULT_LIMIT = 5


def _is_prime_customer(user) -> bool:
    return user.role == UserRole.CUSTOMER and user.is_prime


class VendorService:
    def __init__(self, db: Session):
        self.db = db
        self.vendors = VendorRepository(db)
        self.users = UserRepository(db)
        self.bookings = BookingRepository(db)

    def search(
        self,
        *,
        current_user,
        category: str | None = None,
        categories: list[str] | None = None,
        location: str | None = None,
        min_rating: float | None = None,
        min_budget: float | None = None,
        max_budget: float | None = None,
    ):
        profiles = self.users.list_vendor_profiles(
            category=category, categories=categories, location=location, min_rating=min_rating, max_budget=max_budget
        )
        if min_budget is not None or max_budget is not None:
            def in_budget(price: float) -> bool:
                if min_budget is not None and price < min_budget:
                    return False
                if max_budget is not None and price > max_budget:
                    return False
                return True

            filtered = []
            for profile in profiles:
                packages = self.vendors.list_packages(profile.id)
                if any(in_budget(p.price) for p in packages) or not packages:
                    filtered.append(profile)
            profiles = filtered

        if not _is_prime_customer(current_user):
            profiles = [p for p in profiles if p.category in FREE_TIER_CATEGORIES][:FREE_TIER_RESULT_LIMIT]

        return profiles

    def get_vendor_detail(self, vendor_id: int, current_user) -> VendorDetailOut:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        detail = VendorDetailOut.model_validate(profile)
        detail.contact_number = profile.user.mobile if _is_prime_customer(current_user) else None
        return detail

    def get_own_profile(self, user) -> "VendorProfile":  # noqa: F821
        if not user.vendor_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
        return user.vendor_profile

    def list_own_packages(self, vendor_profile) -> list[VendorPackage]:
        """All of the vendor's own packages, active or not (unlike the public
        search/detail views, which only ever show active ones)."""
        return sorted(vendor_profile.packages, key=lambda p: p.created_at, reverse=True)

    def create_package(self, vendor_profile, payload: VendorPackageCreate) -> VendorPackage:
        package = VendorPackage(vendor_id=vendor_profile.id, **payload.model_dump())
        return self.vendors.create_package(package)

    def update_package(self, vendor_profile, package_id: int, payload: VendorPackageUpdate) -> VendorPackage:
        package = self.vendors.get_package(package_id)
        if not package or package.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(package, field, value)
        return self.vendors.update_package(package)

    def delete_package(self, vendor_profile, package_id: int) -> None:
        package = self.vendors.get_package(package_id)
        if not package or package.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
        self.vendors.delete_package(package)

    def list_own_reviews(self, vendor_profile) -> list[VendorReview]:
        return self.vendors.list_reviews(vendor_profile.id)

    def add_review(self, user_id: int, vendor_id: int, payload: VendorReviewCreate) -> VendorReview:
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        review = VendorReview(vendor_id=vendor_id, user_id=user_id, **payload.model_dump())
        review = self.vendors.create_review(review)

        # Recompute the running average rating for the vendor.
        new_count = profile.rating_count + 1
        new_avg = ((profile.rating_avg * profile.rating_count) + review.rating) / new_count
        profile.rating_avg = round(new_avg, 2)
        profile.rating_count = new_count
        self.db.commit()

        return review

    # --- availability ---

    def get_unavailable_dates(self, vendor_id: int) -> list[date]:
        """The full set of dates this vendor can't be booked on: manually
        blocked dates, unioned with dates that already have a CONFIRMED booking."""
        manual = {b.date for b in self.vendors.list_blocked_dates(vendor_id)}
        confirmed = set(self.bookings.list_confirmed_event_dates(vendor_id))
        return sorted(manual | confirmed)

    def list_own_blocked_dates(self, vendor_profile) -> list[VendorBlockedDate]:
        return self.vendors.list_blocked_dates(vendor_profile.id)

    def block_date(self, vendor_profile, payload: VendorBlockedDateCreate) -> VendorBlockedDate:
        existing = next((b for b in self.vendors.list_blocked_dates(vendor_profile.id) if b.date == payload.date), None)
        if existing:
            return existing
        blocked = VendorBlockedDate(vendor_id=vendor_profile.id, date=payload.date)
        return self.vendors.create_blocked_date(blocked)

    def unblock_date(self, vendor_profile, blocked_id: int) -> None:
        blocked = self.vendors.get_blocked_date(blocked_id)
        if not blocked or blocked.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blocked date not found")
        self.vendors.delete_blocked_date(blocked)
