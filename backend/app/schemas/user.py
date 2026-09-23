from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class VendorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_name: str
    category: str
    description: str | None = None
    location: str | None = None
    documents: list[str] | None = None
    commission_rate: float
    rating_avg: float
    rating_count: int
    is_approved: bool
    is_blocked: bool
    is_featured: bool
    created_at: datetime


class VendorProfileAdminOut(VendorProfileOut):
    """Admin-only view: adds who actually registered as this vendor.

    The public VendorProfileOut deliberately stops at business-facing fields;
    this extends it with the linked account's name/contact so admin screens
    (Vendor Management, Commissions) can show the registrant, not just the
    business name.
    """

    owner_full_name: str
    owner_username: str
    owner_email: str | None = None
    owner_mobile: str | None = None


class VendorProfileUpdate(BaseModel):
    business_name: str | None = None
    category: str | None = None
    description: str | None = None
    location: str | None = None
    documents: list[str] | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: str | None = None
    mobile: str | None = None
    role: UserRole
    is_active: bool
    is_prime: bool
    created_at: datetime
    vendor_profile: VendorProfileOut | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    mobile: str | None = None
