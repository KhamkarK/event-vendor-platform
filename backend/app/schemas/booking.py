from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.booking import BookingStatus, QuotationStatus


class BookingCreate(BaseModel):
    event_id: int
    vendor_id: int
    package_id: int | None = None
    budget_category_id: int | None = None
    notes: str | None = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class QuotationCreate(BaseModel):
    booking_id: int
    amount: float = Field(gt=0)
    details: str | None = None


class QuotationRespond(BaseModel):
    status: QuotationStatus


class QuotationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    vendor_id: int
    amount: float
    details: str | None = None
    status: QuotationStatus
    created_at: datetime


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    vendor_id: int
    package_id: int | None = None
    budget_category_id: int | None = None
    status: BookingStatus
    total_amount: float
    advance_amount: float
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    # Denormalized read-only fields (via model properties) so the customer-facing
    # "compare quotations" view doesn't need N extra requests per booking.
    vendor_name: str | None = None
    package_title: str | None = None
    quotations: list[QuotationOut] = []


class WishlistCreate(BaseModel):
    vendor_id: int


class WishlistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    vendor_id: int
    created_at: datetime
