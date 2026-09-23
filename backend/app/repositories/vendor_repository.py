from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vendor import VendorBlockedDate, VendorPackage, VendorReview


class VendorRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_package(self, package: VendorPackage) -> VendorPackage:
        self.db.add(package)
        self.db.commit()
        self.db.refresh(package)
        return package

    def get_package(self, package_id: int) -> VendorPackage | None:
        return self.db.get(VendorPackage, package_id)

    def list_packages(self, vendor_id: int) -> list[VendorPackage]:
        return list(
            self.db.scalars(select(VendorPackage).where(VendorPackage.vendor_id == vendor_id, VendorPackage.is_active.is_(True)))
        )

    def update_package(self, package: VendorPackage) -> VendorPackage:
        self.db.commit()
        self.db.refresh(package)
        return package

    def delete_package(self, package: VendorPackage) -> None:
        self.db.delete(package)
        self.db.commit()

    def create_review(self, review: VendorReview) -> VendorReview:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def list_reviews(self, vendor_id: int) -> list[VendorReview]:
        return list(
            self.db.scalars(
                select(VendorReview).where(VendorReview.vendor_id == vendor_id).order_by(VendorReview.created_at.desc())
            )
        )

    # --- blocked dates (manual availability blocks) ---

    def create_blocked_date(self, blocked: VendorBlockedDate) -> VendorBlockedDate:
        self.db.add(blocked)
        self.db.commit()
        self.db.refresh(blocked)
        return blocked

    def list_blocked_dates(self, vendor_id: int) -> list[VendorBlockedDate]:
        return list(
            self.db.scalars(
                select(VendorBlockedDate).where(VendorBlockedDate.vendor_id == vendor_id).order_by(VendorBlockedDate.date)
            )
        )

    def get_blocked_date(self, blocked_id: int) -> VendorBlockedDate | None:
        return self.db.get(VendorBlockedDate, blocked_id)

    def delete_blocked_date(self, blocked: VendorBlockedDate) -> None:
        self.db.delete(blocked)
        self.db.commit()
