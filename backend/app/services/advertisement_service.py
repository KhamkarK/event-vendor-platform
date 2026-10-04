from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.advertisement import Advertisement, AdvertisementMediaType


class AdvertisementService:
    def __init__(self, db: Session):
        self.db = db

    def get_active(self) -> Advertisement | None:
        stmt = select(Advertisement).where(Advertisement.is_active.is_(True)).order_by(Advertisement.created_at.desc())
        return self.db.scalars(stmt).first()

    def _deactivate_all_active(self) -> None:
        for ad in self.db.scalars(select(Advertisement).where(Advertisement.is_active.is_(True))):
            ad.is_active = False

    def create(self, media_url: str, media_type: AdvertisementMediaType, link_url: str | None) -> Advertisement:
        """Replaces whatever ad is currently active — only one is ever shown at a time."""
        self._deactivate_all_active()
        advertisement = Advertisement(media_url=media_url, media_type=media_type, link_url=link_url, is_active=True)
        self.db.add(advertisement)
        self.db.commit()
        self.db.refresh(advertisement)
        return advertisement

    def deactivate_active(self) -> None:
        self._deactivate_all_active()
        self.db.commit()
