from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_vendor
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import VendorProfileOut
from app.schemas.vendor import (
    VendorDetailOut,
    VendorPackageCreate,
    VendorPackageOut,
    VendorPackageUpdate,
    VendorReviewCreate,
    VendorReviewOut,
    VendorSearchResult,
)
from app.services.vendor_service import VendorService

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("", response_model=list[VendorSearchResult])
def search_vendors(
    category: str | None = Query(default=None),
    location: str | None = Query(default=None),
    min_rating: float | None = Query(default=None, ge=0, le=5),
    max_budget: float | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    return VendorService(db).search(category=category, location=location, min_rating=min_rating, max_budget=max_budget)


@router.get("/{vendor_id}", response_model=VendorDetailOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    return VendorService(db).get_vendor_detail(vendor_id)


@router.post("/{vendor_id}/reviews", response_model=VendorReviewOut, status_code=201)
def add_review(
    vendor_id: int,
    payload: VendorReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return VendorService(db).add_review(current_user.id, vendor_id, payload)


# --- Vendor's own package management ---

package_router = APIRouter(prefix="/vendors/me/packages", tags=["vendor-packages"])


@package_router.get("", response_model=list[VendorPackageOut])
def list_my_packages(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    service = VendorService(db)
    profile = service.get_own_profile(current_user)
    return service.list_own_packages(profile)


@package_router.post("", response_model=VendorPackageOut, status_code=201)
def create_package(payload: VendorPackageCreate, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    service = VendorService(db)
    profile = service.get_own_profile(current_user)
    return service.create_package(profile, payload)


@package_router.patch("/{package_id}", response_model=VendorPackageOut)
def update_package(
    package_id: int,
    payload: VendorPackageUpdate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    service = VendorService(db)
    profile = service.get_own_profile(current_user)
    return service.update_package(profile, package_id, payload)


@package_router.delete("/{package_id}", status_code=204)
def delete_package(package_id: int, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    service = VendorService(db)
    profile = service.get_own_profile(current_user)
    service.delete_package(profile, package_id)
