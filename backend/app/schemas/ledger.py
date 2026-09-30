from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ledger import InvoiceStatus, LedgerEntryType


class LedgerEntryCreate(BaseModel):
    booking_id: int | None = None
    entry_type: LedgerEntryType
    amount: float = Field(gt=0)
    description: str | None = None


class LedgerEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    booking_id: int | None = None
    entry_type: LedgerEntryType
    amount: float
    description: str | None = None
    created_at: datetime
    # Denormalized read-only fields (via model properties), derived from the
    # linked booking, so the ledger can be grouped/labeled by event client-side.
    event_id: int | None = None
    event_name: str | None = None


class InvoiceCreate(BaseModel):
    booking_id: int
    amount: float = Field(gt=0)
    due_date: date | None = None


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    booking_id: int
    invoice_number: str
    amount: float
    status: InvoiceStatus
    due_date: date | None = None
    created_at: datetime


class EventAdvanceSummary(BaseModel):
    """Advance-payment breakdown for one event, derived from the vendor's
    ledger entries and booking(s) tied to that event — see LedgerService."""

    event_id: int
    event_name: str
    total_amount: float
    paid: float
    utilized: float
    remaining: float
    outstanding: float


class VendorLedgerSummary(BaseModel):
    total_credit: float
    total_debit: float
    net_balance: float
    pending_dues: float
    entries: list[LedgerEntryOut]
    invoices: list[InvoiceOut]
    event_summaries: list[EventAdvanceSummary]
