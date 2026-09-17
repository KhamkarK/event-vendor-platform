from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_vendor
from app.db.session import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingStatusUpdate,
    QuotationCreate,
    QuotationOut,
    QuotationRespond,
    WishlistCreate,
    WishlistOut,
)
from app.services.booking_service import BookingService
from app.services.vendor_service import VendorService

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BookingService(db).create_booking(current_user.id, payload)


@router.get("/by-event/{event_id}", response_model=list[BookingOut])
def list_bookings_for_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BookingService(db).list_by_event(event_id, current_user.id)


@router.get("/vendor/me", response_model=list[BookingOut])
def list_bookings_for_vendor(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    booking_service = BookingService(db)
    profile = VendorService(db).get_own_profile(current_user)
    return booking_service.list_by_vendor(profile)


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    booking_service = BookingService(db)
    profile = VendorService(db).get_own_profile(current_user)
    return booking_service.update_status(booking_id, profile, payload)


@router.post("/{booking_id}/quotations", response_model=QuotationOut, status_code=201)
def request_quotation(
    booking_id: int, payload: QuotationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    payload.booking_id = booking_id
    return BookingService(db).request_quotation(current_user.id, payload)


@router.patch("/quotations/{quotation_id}", response_model=QuotationOut)
def respond_quotation(
    quotation_id: int,
    payload: QuotationRespond,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    booking_service = BookingService(db)
    profile = VendorService(db).get_own_profile(current_user)
    return booking_service.respond_quotation(quotation_id, profile, payload)


# --- Wishlist ---

wishlist_router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@wishlist_router.post("/toggle", response_model=dict)
def toggle_wishlist(payload: WishlistCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BookingService(db).toggle_wishlist(current_user.id, payload)


@wishlist_router.get("", response_model=list[WishlistOut])
def list_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BookingService(db).list_wishlist(current_user.id)
