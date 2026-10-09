"""Site-wide and page-specific advertisement banners, managed by admins (see
app/api/v1/advertisements.py).

Each banner belongs to one `placement` — the site-wide top banner below the
navbar, or one of the Event Types page's own slots — and multiple banners can
be active within a placement at once. The running banner for a placement
(frontend/src/components/common/AdSlot.tsx) rotates through every active row
for that placement in `display_order` order. Deactivated rows are kept as
history rather than deleted; deleting a row via the admin API removes it for
good.
"""
import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AdvertisementMediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class AdvertisementPlacement(str, enum.Enum):
    TOP_BANNER = "top_banner"
    EVENT_TYPES_SIDEBAR = "event_types_sidebar"
    EVENT_TYPES_BOTTOM = "event_types_bottom"


class Advertisement(Base):
    __tablename__ = "advertisements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[AdvertisementMediaType] = mapped_column(
        Enum(AdvertisementMediaType, name="advertisement_media_type"), nullable=False
    )
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Position in the running-banner rotation and in the admin management list,
    # scoped within its own placement; lower sorts first. Set to (current max
    # within the placement + 1) on upload, and swapped between neighbors in the
    # same placement by AdvertisementService.move().
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    placement: Mapped[AdvertisementPlacement] = mapped_column(
        Enum(AdvertisementPlacement, name="advertisement_placement"),
        default=AdvertisementPlacement.TOP_BANNER,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
