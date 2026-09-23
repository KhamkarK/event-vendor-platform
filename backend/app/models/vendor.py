"""Vendor packages, reviews, and manually-blocked availability dates."""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class VendorPackage(Base):
    __tablename__ = "vendor_packages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    photos: Mapped[list | None] = mapped_column(__import__("sqlalchemy").JSON, nullable=True, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor: Mapped["VendorProfile"] = relationship("VendorProfile", back_populates="packages")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="package")


class VendorReview(Base):
    __tablename__ = "vendor_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id: Mapped[int | None] = mapped_column(ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)

    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    vendor: Mapped["VendorProfile"] = relationship("VendorProfile", back_populates="reviews")
    user: Mapped["User"] = relationship("User", back_populates="reviews")


class VendorBlockedDate(Base):
    """A single calendar date the vendor has manually marked unavailable.

    Dates that are unavailable because of a CONFIRMED booking are deliberately
    NOT stored here — they're computed on the fly (see VendorService.get_unavailable_dates)
    so there's nothing to keep in sync if a booking is later cancelled.
    """

    __tablename__ = "vendor_blocked_dates"
    __table_args__ = (UniqueConstraint("vendor_id", "date", name="uq_vendor_blocked_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    vendor: Mapped["VendorProfile"] = relationship("VendorProfile", back_populates="blocked_dates")
