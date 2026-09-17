from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vendor import VendorPackage, VendorReview
from app.repositories.user_repository import UserRepository
from app.repositories.vendor_repository import VendorRepository
from app.schemas.vendor import VendorPackageCreate, VendorPackageUpdate, VendorReviewCreate


class VendorService:
    def __init__(self, db: Session):
        self.db = db
        self.vendors = VendorRepository(db)
        self.users = UserRepository(db)

    def search(
        self,
        *,
        category: str | None = None,
        location: str | None = None,
        min_rating: float | None = None,
        max_budget: float | None = None,
    ):
        profiles = self.users.list_vendor_profiles(
            category=category, location=location, min_rating=min_rating, max_budget=max_budget
        )
        if max_budget is not None:
            filtered = []
            for profile in profiles:
                packages = self.vendors.list_packages(profile.id)
                if any(p.price <= max_budget for p in packages) or not packages:
                    filtered.append(profile)
            profiles = filtered
        return profiles

    def get_vendor_detail(self, vendor_id: int):
        profile = self.users.get_vendor_profile(vendor_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        return profile

    def get_own_profile(self, user) -> "VendorProfile":  # noqa: F821
        if not user.vendor_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
        return user.vendor_profile

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

    def add_review(self, user_id: int, vendor_id: int, payload: VendorReviewCreate) -> VendorReview:
        profile = self.get_vendor_detail(vendor_id)
        review = VendorReview(vendor_id=vendor_id, user_id=user_id, **payload.model_dump())
        review = self.vendors.create_review(review)

        # Recompute the running average rating for the vendor.
        new_count = profile.rating_count + 1
        new_avg = ((profile.rating_avg * profile.rating_count) + review.rating) / new_count
        profile.rating_avg = round(new_avg, 2)
        profile.rating_count = new_count
        self.db.commit()

        return review
