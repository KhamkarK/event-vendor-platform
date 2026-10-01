import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.ledger import Invoice, InvoiceStatus, LedgerEntry
from app.repositories.booking_repository import BookingRepository
from app.repositories.ledger_repository import LedgerRepository
from app.schemas.ledger import EventAdvanceSummary, InvoiceCreate, LedgerEntryCreate, LedgerEntryUpdate, VendorLedgerSummary


class LedgerService:
    def __init__(self, db: Session):
        self.db = db
        self.ledger = LedgerRepository(db)
        self.bookings = BookingRepository(db)

    def add_entry(self, vendor_profile, payload: LedgerEntryCreate) -> LedgerEntry:
        entry = LedgerEntry(vendor_id=vendor_profile.id, **payload.model_dump())
        return self.ledger.create_entry(entry)

    def update_entry(self, vendor_profile, entry_id: int, payload: LedgerEntryUpdate) -> LedgerEntry:
        entry = self.ledger.get_entry(entry_id)
        if not entry or entry.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ledger entry not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(entry, field, value)
        return self.ledger.update_entry(entry)

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
            event_summaries=self._build_event_summaries(vendor_profile.id, entries),
        )

    def _build_event_summaries(self, vendor_id: int, entries: list[LedgerEntry]) -> list[EventAdvanceSummary]:
        """Advance Paid -> Utilized -> Remaining -> Outstanding per event, derived
        from this vendor's bookings (total_amount) and ledger entries (credit =
        paid by customer, debit = refund/payout/expense against that advance)."""
        bookings: list[Booking] = self.bookings.list_by_vendor(vendor_id)

        event_names: dict[int, str] = {}
        event_totals: dict[int, float] = {}
        for booking in bookings:
            if booking.event_id is None:
                continue
            event_totals[booking.event_id] = event_totals.get(booking.event_id, 0.0) + booking.total_amount
            event_names.setdefault(booking.event_id, booking.event_name or f"Event #{booking.event_id}")

        paid_by_event: dict[int, float] = {}
        utilized_by_event: dict[int, float] = {}
        for entry in entries:
            if entry.event_id is None:
                continue
            if entry.entry_type.value == "credit":
                paid_by_event[entry.event_id] = paid_by_event.get(entry.event_id, 0.0) + entry.amount
            else:
                utilized_by_event[entry.event_id] = utilized_by_event.get(entry.event_id, 0.0) + entry.amount

        summaries = []
        for event_id, total_amount in event_totals.items():
            paid = paid_by_event.get(event_id, 0.0)
            utilized = utilized_by_event.get(event_id, 0.0)
            summaries.append(
                EventAdvanceSummary(
                    event_id=event_id,
                    event_name=event_names[event_id],
                    total_amount=round(total_amount, 2),
                    paid=round(paid, 2),
                    utilized=round(utilized, 2),
                    remaining=round(paid - utilized, 2),
                    outstanding=round(max(total_amount - paid, 0.0), 2),
                )
            )
        return summaries
