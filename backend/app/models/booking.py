"""Bookings, wishlist, and quotations tying users, vendors and events together."""
import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    INTERESTED = "interested"
    QUOTE_REQUESTED = "quote_requested"
    QUOTED = "quoted"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class QuotationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)
    package_id: Mapped[int | None] = mapped_column(ForeignKey("vendor_packages.id", ondelete="SET NULL"), nullable=True)
    budget_category_id: Mapped[int | None] = mapped_column(
        ForeignKey("budget_allocations.id", ondelete="SET NULL"), nullable=True
    )

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status"), default=BookingStatus.INTERESTED, nullable=False
    )
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    advance_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    event: Mapped["Event"] = relationship("Event", back_populates="bookings")
    vendor: Mapped["VendorProfile"] = relationship("VendorProfile", back_populates="bookings")
    package: Mapped["VendorPackage | None"] = relationship("VendorPackage", back_populates="bookings")
    budget_category: Mapped["BudgetAllocation | None"] = relationship("BudgetAllocation", back_populates="bookings")
    quotations: Mapped[list["Quotation"]] = relationship("Quotation", back_populates="booking", cascade="all, delete-orphan")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship("LedgerEntry", back_populates="booking")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="booking")

    @property
    def vendor_name(self) -> str | None:
        """Read-only convenience field for BookingOut — avoids a second lookup client-side."""
        return self.vendor.business_name if self.vendor else None

    @property
    def package_title(self) -> str | None:
        return self.package.title if self.package else None


class Wishlist(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="wishlist_items")


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[QuotationStatus] = mapped_column(
        Enum(QuotationStatus, name="quotation_status"), default=QuotationStatus.PENDING, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    booking: Mapped["Booking"] = relationship("Booking", back_populates="quotations")
