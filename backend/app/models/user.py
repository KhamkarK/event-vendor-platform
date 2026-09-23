"""User and vendor-profile models.

A single `users` table backs all three account types (customer, vendor, admin),
distinguished by the `role` column. Vendor-specific fields live in `VendorProfile`,
a 1:1 extension table, so the base user model stays lean for all roles.
"""
import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    mobile: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.CUSTOMER, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # OTP verification is a planned future phase; columns exist now so the
    # schema doesn't need another migration when it ships.
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_mobile_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Admin-managed "Prime Member" tag for customers (set via the admin Customers
    # tab drag board); currently admin-side only, no customer-facing effect yet.
    is_prime: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendor_profile: Mapped["VendorProfile | None"] = relationship(
        "VendorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    events: Mapped[list["Event"]] = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    wishlist_items: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    reviews: Mapped[list["VendorReview"]] = relationship("VendorReview", back_populates="user")


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. Catering, Venue, Photography
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    documents: Mapped[list | None] = mapped_column(  # list of uploaded document URLs for KYC
        __import__("sqlalchemy").JSON, nullable=True, default=list
    )

    commission_rate: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)  # percentage, 5-15
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="vendor_profile")
    packages: Mapped[list["VendorPackage"]] = relationship("VendorPackage", back_populates="vendor", cascade="all, delete-orphan")
    reviews: Mapped[list["VendorReview"]] = relationship("VendorReview", back_populates="vendor", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="vendor")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship("LedgerEntry", back_populates="vendor", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="vendor", cascade="all, delete-orphan")

    # Read-only proxies onto the linked account, so admin-facing schemas can
    # surface who actually registered as this vendor without duplicating
    # columns that already live on `User`.
    @property
    def owner_full_name(self) -> str:
        return self.user.full_name

    @property
    def owner_username(self) -> str:
        return self.user.username

    @property
    def owner_email(self) -> str | None:
        return self.user.email

    @property
    def owner_mobile(self) -> str | None:
        return self.user.mobile
