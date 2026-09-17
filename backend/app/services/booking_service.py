from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus, Quotation, Wishlist
from app.repositories.booking_repository import BookingRepository
from app.repositories.event_repository import EventRepository
from app.repositories.user_repository import UserRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, QuotationCreate, QuotationRespond, WishlistCreate


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.bookings = BookingRepository(db)
        self.events = EventRepository(db)
        self.users = UserRepository(db)

    def create_booking(self, user_id: int, payload: BookingCreate) -> Booking:
        event = self.events.get_by_id(payload.event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        vendor = self.users.get_vendor_profile(payload.vendor_id)
        if not vendor or not vendor.is_approved or vendor.is_blocked:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not available")

        booking = Booking(
            event_id=payload.event_id,
            vendor_id=payload.vendor_id,
            package_id=payload.package_id,
            budget_category_id=payload.budget_category_id,
            notes=payload.notes,
            status=BookingStatus.INTERESTED,
        )
        return self.bookings.create(booking)

    def list_by_event(self, event_id: int, user_id: int) -> list[Booking]:
        event = self.events.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return self.bookings.list_by_event(event_id)

    def list_by_vendor(self, vendor_profile) -> list[Booking]:
        return self.bookings.list_by_vendor(vendor_profile.id)

    def update_status(self, booking_id: int, vendor_profile, payload: BookingStatusUpdate) -> Booking:
        booking = self.bookings.get_by_id(booking_id)
        if not booking or booking.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        booking.status = payload.status
        return self.bookings.update(booking)

    # --- wishlist ---

    def toggle_wishlist(self, user_id: int, payload: WishlistCreate) -> dict:
        existing = self.bookings.get_wishlist_item(user_id, payload.vendor_id)
        if existing:
            self.bookings.remove_wishlist(existing)
            return {"wishlisted": False}
        self.bookings.add_wishlist(Wishlist(user_id=user_id, vendor_id=payload.vendor_id))
        return {"wishlisted": True}

    def list_wishlist(self, user_id: int) -> list[Wishlist]:
        return self.bookings.list_wishlist(user_id)

    # --- quotations ---

    def request_quotation(self, user_id: int, payload: QuotationCreate) -> Quotation:
        booking = self.bookings.get_by_id(payload.booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        booking.status = BookingStatus.QUOTE_REQUESTED
        self.bookings.update(booking)
        quotation = Quotation(booking_id=payload.booking_id, vendor_id=booking.vendor_id, amount=payload.amount, details=payload.details)
        return self.bookings.create_quotation(quotation)

    def respond_quotation(self, quotation_id: int, vendor_profile, payload: QuotationRespond) -> Quotation:
        quotation = self.bookings.get_quotation(quotation_id)
        if not quotation or quotation.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
        quotation.status = payload.status
        quotation = self.bookings.update_quotation(quotation)

        booking = self.bookings.get_by_id(quotation.booking_id)
        if booking:
            if payload.status.value == "accepted":
                booking.status = BookingStatus.QUOTED
                booking.total_amount = quotation.amount
            self.bookings.update(booking)
        return quotation
