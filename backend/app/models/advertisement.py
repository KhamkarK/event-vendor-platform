"""Site-wide advertisement banners, managed by admins (see app/api/v1/advertisements.py).

Multiple banners can be active at once — the running banner slot
(frontend/src/components/layout/AdBanner.tsx) rotates through every active
row in `display_order` order. Deactivated rows are kept as history rather
than deleted; deleting a row via the admin API removes it for good.
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
    # Position in the running-banner rotation and in the admin management list;
    # lower sorts first. Set to (current max + 1) on upload so new banners are
    # appended, and swapped between neighbors by AdvertisementService.move().
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
