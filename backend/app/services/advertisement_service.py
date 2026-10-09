from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.advertisement import Advertisement, AdvertisementMediaType, AdvertisementPlacement


class AdvertisementService:
    def __init__(self, db: Session):
        self.db = db

    def list_active_ordered(self, placement: AdvertisementPlacement) -> list[Advertisement]:
        """Every active banner for one placement, in the sequence the running
        banner should show them."""
        stmt = (
            select(Advertisement)
            .where(Advertisement.placement == placement, Advertisement.is_active.is_(True))
            .order_by(Advertisement.display_order, Advertisement.created_at)
        )
        return list(self.db.scalars(stmt).all())

    def list_all_ordered(self, placement: AdvertisementPlacement) -> list[Advertisement]:
        """Every banner for one placement, active and inactive, for the admin
        management list."""
        stmt = (
            select(Advertisement)
            .where(Advertisement.placement == placement)
            .order_by(Advertisement.display_order, Advertisement.created_at)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, advertisement_id: int) -> Advertisement | None:
        return self.db.get(Advertisement, advertisement_id)

    def create(
        self,
        media_url: str,
        media_type: AdvertisementMediaType,
        link_url: str | None,
        placement: AdvertisementPlacement,
    ) -> Advertisement:
        """Appends a new banner to the end of its placement's rotation; other
        placements and existing banners are left untouched."""
        next_order = (
            self.db.scalar(select(func.max(Advertisement.display_order)).where(Advertisement.placement == placement))
            or 0
        ) + 1
        advertisement = Advertisement(
            media_url=media_url,
            media_type=media_type,
            link_url=link_url,
            is_active=True,
            display_order=next_order,
            placement=placement,
        )
        self.db.add(advertisement)
        self.db.commit()
        self.db.refresh(advertisement)
        return advertisement

    def update(self, advertisement_id: int, **fields) -> Advertisement | None:
        """Applies only the given fields (e.g. is_active and/or link_url)."""
        advertisement = self.get(advertisement_id)
        if not advertisement:
            return None
        for key, value in fields.items():
            setattr(advertisement, key, value)
        self.db.commit()
        self.db.refresh(advertisement)
        return advertisement

    def move(self, advertisement_id: int, direction: str) -> Advertisement | None:
        """Swaps display_order with the adjacent banner within the same
        placement, moving it one step earlier ("up") or later ("down")."""
        advertisement = self.get(advertisement_id)
        if not advertisement:
            return None

        ordered = self.list_all_ordered(advertisement.placement)
        index = next((i for i, ad in enumerate(ordered) if ad.id == advertisement_id), None)
        if index is None:
            return None

        swap_index = index - 1 if direction == "up" else index + 1
        if swap_index < 0 or swap_index >= len(ordered):
            return ordered[index]

        current, neighbor = ordered[index], ordered[swap_index]
        current.display_order, neighbor.display_order = neighbor.display_order, current.display_order
        self.db.commit()
        self.db.refresh(current)
        return current

    def delete(self, advertisement_id: int) -> bool:
        advertisement = self.get(advertisement_id)
        if not advertisement:
            return False
        self.db.delete(advertisement)
        self.db.commit()
        return True
