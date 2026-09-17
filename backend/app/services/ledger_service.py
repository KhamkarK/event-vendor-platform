import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.ledger import Invoice, InvoiceStatus, LedgerEntry
from app.repositories.ledger_repository import LedgerRepository
from app.schemas.ledger import InvoiceCreate, LedgerEntryCreate, VendorLedgerSummary


class LedgerService:
    def __init__(self, db: Session):
        self.db = db
        self.ledger = LedgerRepository(db)

    def add_entry(self, vendor_profile, payload: LedgerEntryCreate) -> LedgerEntry:
        entry = LedgerEntry(vendor_id=vendor_profile.id, **payload.model_dump())
        return self.ledger.create_entry(entry)

    def create_invoice(self, vendor_profile, payload: InvoiceCreate) -> Invoice:
        invoice = Invoice(
            vendor_id=vendor_profile.id,
            booking_id=payload.booking_id,
            invoice_number=f"INV-{vendor_profile.id:04d}-{uuid.uuid4().hex[:8].upper()}",
            amount=payload.amount,
            due_date=payload.due_date,
            status=InvoiceStatus.PENDING,
        )
        return self.ledger.create_invoice(invoice)

    def mark_invoice_paid(self, vendor_profile, invoice_id: int) -> Invoice:
        invoice = self.ledger.get_invoice(invoice_id)
        if not invoice or invoice.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        invoice.status = InvoiceStatus.PAID
        return self.ledger.update_invoice(invoice)

    def get_summary(self, vendor_profile) -> VendorLedgerSummary:
        entries = self.ledger.list_entries(vendor_profile.id)
        invoices = self.ledger.list_invoices(vendor_profile.id)
        total_credit = sum(e.amount for e in entries if e.entry_type.value == "credit")
        total_debit = sum(e.amount for e in entries if e.entry_type.value == "debit")
        pending_dues = sum(i.amount for i in invoices if i.status != InvoiceStatus.PAID)
        return VendorLedgerSummary(
            total_credit=total_credit,
            total_debit=total_debit,
            net_balance=total_credit - total_debit,
            pending_dues=pending_dues,
            entries=entries,
            invoices=invoices,
        )
