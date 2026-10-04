"""Site-wide advertisement banner, managed by admins (see app/api/v1/advertisements.py).

Only one Advertisement is ever "active" at a time — uploading a new one
(AdvertisementService.create) deactivates whatever was active before, so the
single banner slot (frontend/src/components/layout/AdBanner.tsx) always shows
the most recent upload. Deactivated rows are kept as history rather than deleted.
"""
import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AdvertisementMediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class Advertisement(Base):
    __tablename__ = "advertisements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[AdvertisementMediaType] = mapped_column(
        Enum(AdvertisementMediaType, name="advertisement_media_type"), nullable=False
    )
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
