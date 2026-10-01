from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus, Quotation, Wishlist
from app.repositories.booking_repository import BookingRepository
from app.repositories.event_repository import EventRepository
from app.repositories.user_repository import UserRepository
from app.schemas.booking import BookingCreate, BookingStatusUpdate, QuotationCreate, QuotationRespond, WishlistCreate
from app.services.vendor_service import VendorService


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.bookings = BookingRepository(db)
        self.events = EventRepository(db)
        self.users = UserRepository(db)
        self.vendor_service = VendorService(db)

    def create_booking(self, user_id: int, payload: BookingCreate) -> Booking:
        event = self.events.get_by_id(payload.event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        vendor = self.users.get_vendor_profile(payload.vendor_id)
        if not vendor or not vendor.is_approved or vendor.is_blocked:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not available")
        if event.event_date in self.vendor_service.get_unavailable_dates(payload.vendor_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"This vendor is not available on {event.event_date.isoformat()}.",
            )

        booking = Booking(
            event_id=payload.event_id,
            vendor_id=payload.vendor_id,
            package_id=payload.package_id,
            budget_category_id=payload.budget_category_id,
            notes=payload.notes,
            requested_date=payload.requested_date,
            guest_count=payload.guest_count,
            status=BookingStatus.QUOTE_REQUESTED,
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

    def request_quotation(self, vendor_profile, payload: QuotationCreate) -> Quotation:
        """Vendor responds to a customer's quotation request with an amount + details."""
        booking = self.bookings.get_by_id(payload.booking_id)
        if not booking or booking.vendor_id != vendor_profile.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        booking.status = BookingStatus.QUOTED
        self.bookings.update(booking)
        quotation = Quotation(booking_id=payload.booking_id, vendor_id=vendor_profile.id, amount=payload.amount, details=payload.details)
        return self.bookings.create_quotation(quotation)

    def respond_quotation(self, user_id: int, quotation_id: int, payload: QuotationRespond) -> Quotation:
        """Customer accepts/rejects a quotation the vendor sent for their event."""
        quotation = self.bookings.get_quotation(quotation_id)
        booking = self.bookings.get_by_id(quotation.booking_id) if quotation else None
        event = self.events.get_by_id(booking.event_id) if booking else None
        if not quotation or not booking or not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
        quotation.status = payload.status
        quotation = self.bookings.update_quotation(quotation)

        if payload.status.value == "accepted":
            booking.total_amount = quotation.amount
            self.bookings.update(booking)
        return quotation
