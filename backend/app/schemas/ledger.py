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


class VendorLedgerSummary(BaseModel):
    total_credit: float
    total_debit: float
    net_balance: float
    pending_dues: float
    entries: list[LedgerEntryOut]
    invoices: list[InvoiceOut]
