from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.user import UserRole

MAX_PROFILE_URLS = 3


class VendorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_name: str
    category: str
    description: str | None = None
    location: str | None = None
    # Instagram/website link, shown to customers on the vendor search card
    # below the contact number (see app/services/vendor_service.py).
    profile_url: str | None = None
    # Up to 3 Instagram/website links, shown to customers on the vendor search
    # card and the vendor detail page.
    profile_urls: list[str] | None = None
    documents: list[str] | None = None
    commission_rate: float
    rating_avg: float
    rating_count: int
    is_approved: bool
    is_blocked: bool
    is_featured: bool
    featured_requested: bool
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
    profile_url: str | None = None
    profile_urls: list[str] | None = None
    documents: list[str] | None = None

    @field_validator("profile_urls")
    @classmethod
    def validate_profile_urls(cls, urls: list[str] | None) -> list[str] | None:
        if urls is None:
            return None
        # Trim, drop blanks and duplicates (order kept).
        cleaned = list(dict.fromkeys(url.strip() for url in urls if url.strip()))
        if len(cleaned) > MAX_PROFILE_URLS:
            raise ValueError(f"At most {MAX_PROFILE_URLS} profile links are allowed")
        for url in cleaned:
            if len(url) > 500:
                raise ValueError("Each profile link must be at most 500 characters")
            # http(s) only — the links are rendered as clickable anchors for customers.
            if not url.lower().startswith(("http://", "https://")):
                raise ValueError("Each profile link must start with http:// or https://")
        return cleaned


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
    prime_requested: bool
    created_at: datetime
    vendor_profile: VendorProfileOut | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    mobile: str | None = None


class AdminPasswordReset(BaseModel):
    """Admin-set password for a vendor or customer account — no email/token
    flow involved; the admin sets the new password directly (see AdminService
    .reset_customer_password / .reset_vendor_password)."""

    new_password: str = Field(min_length=8, max_length=128)
