from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking, Quotation, Wishlist


class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, booking: Booking) -> Booking:
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self.db.get(Booking, booking_id)

    def list_by_event(self, event_id: int) -> list[Booking]:
        # Eager-load what BookingOut denormalizes (vendor name, package title, quotations)
        # so the customer-facing comparison view is a single query, not N+1.
        stmt = (
            select(Booking)
            .where(Booking.event_id == event_id)
            .options(joinedload(Booking.vendor), joinedload(Booking.package), joinedload(Booking.quotations))
        )
        return list(self.db.scalars(stmt).unique())

    def list_by_vendor(self, vendor_id: int) -> list[Booking]:
        return list(self.db.scalars(select(Booking).where(Booking.vendor_id == vendor_id).order_by(Booking.created_at.desc())))

    def update(self, booking: Booking) -> Booking:
        self.db.commit()
        self.db.refresh(booking)
        return booking

    # --- wishlist ---

    def add_wishlist(self, item: Wishlist) -> Wishlist:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_wishlist(self, user_id: int) -> list[Wishlist]:
        return list(self.db.scalars(select(Wishlist).where(Wishlist.user_id == user_id)))

    def get_wishlist_item(self, user_id: int, vendor_id: int) -> Wishlist | None:
        return self.db.scalar(select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.vendor_id == vendor_id))

    def remove_wishlist(self, item: Wishlist) -> None:
        self.db.delete(item)
        self.db.commit()

    # --- quotations ---

    def create_quotation(self, quotation: Quotation) -> Quotation:
        self.db.add(quotation)
        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def get_quotation(self, quotation_id: int) -> Quotation | None:
        return self.db.get(Quotation, quotation_id)

    def list_quotations_by_booking(self, booking_id: int) -> list[Quotation]:
        return list(self.db.scalars(select(Quotation).where(Quotation.booking_id == booking_id)))

    def update_quotation(self, quotation: Quotation) -> Quotation:
        self.db.commit()
        self.db.refresh(quotation)
        return quotation
