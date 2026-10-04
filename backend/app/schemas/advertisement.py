from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.advertisement import AdvertisementMediaType


class AdvertisementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    media_url: str
    media_type: AdvertisementMediaType
    link_url: str | None = None
    is_active: bool
    created_at: datetime
