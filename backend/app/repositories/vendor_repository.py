from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vendor import VendorPackage, VendorReview


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
