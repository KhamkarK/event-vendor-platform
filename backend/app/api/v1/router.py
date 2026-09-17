from fastapi import APIRouter

from app.api.v1 import admin, auth, bookings, budget, events, ledger, users, vendors

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(budget.router)
api_router.include_router(vendors.router)
api_router.include_router(vendors.package_router)
api_router.include_router(bookings.router)
api_router.include_router(bookings.wishlist_router)
api_router.include_router(ledger.router)
api_router.include_router(admin.router)
