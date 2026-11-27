"""Site-wide Gold and Silver rates: a public read endpoint (so the running
strip renders on every page, logged in or not) plus an admin-only update
endpoint. See app/services/metal_rate_service.py -- there's only ever one
rate row, set manually by whichever admin last updated it."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.schemas.metal_rate import MetalRateOut, MetalRateUpdate
from app.services.metal_rate_service import MetalRateService

router = APIRouter(prefix="/metal-rates", tags=["metal-rates"])
admin_router = APIRouter(prefix="/admin/metal-rates", tags=["admin-metal-rates"], dependencies=[Depends(require_admin)])


@router.get("", response_model=MetalRateOut)
def get_metal_rate(db: Session = Depends(get_db)):
    """Public and unauthenticated -- read by the running strip on every page."""
    return MetalRateService(db).get()


@admin_router.patch("", response_model=MetalRateOut)
def update_metal_rate(payload: MetalRateUpdate, db: Session = Depends(get_db)):
    return MetalRateService(db).update(payload.gold_rate_per_10g, payload.silver_rate_per_kg)
