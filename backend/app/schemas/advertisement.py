from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.advertisement import AdvertisementMediaType, AdvertisementPlacement


class AdvertisementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    media_url: str
    media_type: AdvertisementMediaType
    link_url: str | None = None
    is_active: bool
    display_order: int
    placement: AdvertisementPlacement
    created_at: datetime


class AdvertisementUpdate(BaseModel):
    """Partial update for one banner. Only fields explicitly sent are applied
    (see api/v1/advertisements.py's use of exclude_unset)."""

    is_active: bool | None = None
    link_url: str | None = None
