from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_vendor
from app.db.session import get_db
from app.models.user import User
from app.schemas.ledger import InvoiceCreate, InvoiceOut, LedgerEntryCreate, LedgerEntryOut, VendorLedgerSummary
from app.services.ledger_service import LedgerService
from app.services.vendor_service import VendorService

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/me", response_model=VendorLedgerSummary)
def get_my_ledger(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    profile = VendorService(db).get_own_profile(current_user)
    return LedgerService(db).get_summary(profile)


@router.post("/me/entries", response_model=LedgerEntryOut, status_code=201)
def add_entry(payload: LedgerEntryCreate, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    profile = VendorService(db).get_own_profile(current_user)
    return LedgerService(db).add_entry(profile, payload)


@router.post("/me/invoices", response_model=InvoiceOut, status_code=201)
def create_invoice(payload: InvoiceCreate, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    profile = VendorService(db).get_own_profile(current_user)
    return LedgerService(db).create_invoice(profile, payload)


@router.patch("/me/invoices/{invoice_id}/mark-paid", response_model=InvoiceOut)
def mark_invoice_paid(invoice_id: int, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    profile = VendorService(db).get_own_profile(current_user)
    return LedgerService(db).mark_invoice_paid(profile, invoice_id)
