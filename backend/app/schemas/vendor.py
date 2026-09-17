from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import VendorProfileOut


class VendorPackageCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None
    category: str = Field(min_length=2, max_length=100)
    price: float = Field(gt=0)
    photos: list[str] | None = None


class VendorPackageUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, gt=0)
    photos: list[str] | None = None
    is_active: bool | None = None


class VendorPackageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    title: str
    description: str | None = None
    category: str
    price: float
    photos: list[str] | None = None
    is_active: bool
    created_at: datetime


class VendorReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    booking_id: int | None = None


class VendorReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    user_id: int
    rating: int
    comment: str | None = None
    created_at: datetime


class VendorSearchResult(VendorProfileOut):
    packages: list[VendorPackageOut] = []


class VendorDetailOut(VendorProfileOut):
    packages: list[VendorPackageOut] = []
    reviews: list[VendorReviewOut] = []
