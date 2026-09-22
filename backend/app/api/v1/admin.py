from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import VendorProfileAdminOut, VendorProfileOut
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    return AdminService(db).get_dashboard_stats()


@router.get("/vendors", response_model=list[VendorProfileAdminOut])
def list_all_vendors(db: Session = Depends(get_db)):
    return AdminService(db).list_all_vendors()


@router.get("/vendors/pending", response_model=list[VendorProfileAdminOut])
def list_pending_vendors(db: Session = Depends(get_db)):
    return AdminService(db).list_pending_vendors()


@router.post("/vendors/{vendor_id}/approve", response_model=VendorProfileOut)
def approve_vendor(vendor_id: int, db: Session = Depends(get_db)):
    return AdminService(db).approve_vendor(vendor_id)


@router.post("/vendors/{vendor_id}/block", response_model=VendorProfileOut)
def block_vendor(vendor_id: int, db: Session = Depends(get_db)):
    return AdminService(db).set_block_status(vendor_id, True)


@router.post("/vendors/{vendor_id}/unblock", response_model=VendorProfileOut)
def unblock_vendor(vendor_id: int, db: Session = Depends(get_db)):
    return AdminService(db).set_block_status(vendor_id, False)


@router.patch("/vendors/{vendor_id}/commission")
def set_commission(vendor_id: int, rate: float, db: Session = Depends(get_db)):
    return AdminService(db).set_commission_rate(vendor_id, rate)


@router.post("/vendors/{vendor_id}/feature", response_model=VendorProfileOut)
def set_featured(vendor_id: int, featured: bool = True, db: Session = Depends(get_db)):
    return AdminService(db).set_featured(vendor_id, featured)
