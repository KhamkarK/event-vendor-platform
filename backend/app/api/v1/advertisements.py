"""Site-wide advertisement banners: a public read endpoint (so the running
banner renders for every visitor, logged in or not) plus admin-only
upload/manage endpoints. See app/services/advertisement_service.py for the
rotation/ordering behavior — multiple banners can be active at once."""
import uuid
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.advertisement import AdvertisementMediaType
from app.schemas.advertisement import AdvertisementOut, AdvertisementUpdate
from app.services.advertisement_service import AdvertisementService

# Content-type -> (file extension, media type). Deliberately a small allow-list
# rather than trusting the client-supplied filename, same approach as app/api/v1/uploads.py.
ALLOWED_AD_TYPES = {
    "image/jpeg": (".jpg", AdvertisementMediaType.IMAGE),
    "image/png": (".png", AdvertisementMediaType.IMAGE),
    "image/webp": (".webp", AdvertisementMediaType.IMAGE),
    "image/gif": (".gif", AdvertisementMediaType.IMAGE),
    "video/mp4": (".mp4", AdvertisementMediaType.VIDEO),
    "video/webm": (".webm", AdvertisementMediaType.VIDEO),
}

router = APIRouter(prefix="/advertisements", tags=["advertisements"])
admin_router = APIRouter(prefix="/admin/advertisements", tags=["admin-advertisements"], dependencies=[Depends(require_admin)])


class AdvertisementMove(BaseModel):
    direction: Literal["up", "down"]


@router.get("/active", response_model=List[AdvertisementOut])
def list_active_advertisements(db: Session = Depends(get_db)):
    """Public and unauthenticated — the running banner shows on every page,
    including for logged-out visitors on Home/About/Contact, cycling through
    every active banner in display_order."""
    return AdvertisementService(db).list_active_ordered()


@admin_router.get("", response_model=List[AdvertisementOut])
def list_all_advertisements(db: Session = Depends(get_db)):
    """Every banner, active and inactive, for the admin management list."""
    return AdvertisementService(db).list_all_ordered()


@admin_router.post("", response_model=AdvertisementOut, status_code=201)
async def upload_advertisement(file: UploadFile, link_url: str | None = Form(default=None), db: Session = Depends(get_db)):
    """Appends a new banner to the rotation (does not replace existing ones)."""
    extension_and_type = ALLOWED_AD_TYPES.get(file.content_type)
    if not extension_and_type:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, WEBP, GIF images or MP4/WEBM videos are allowed",
        )
    extension, media_type = extension_and_type

    contents = await file.read()
    max_mb = settings.MAX_AD_VIDEO_UPLOAD_MB if media_type == AdvertisementMediaType.VIDEO else settings.MAX_UPLOAD_MB
    if len(contents) > max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{media_type.value.capitalize()} must be smaller than {max_mb}MB",
        )

    media_root = Path(settings.MEDIA_ROOT)
    media_root.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    (media_root / filename).write_bytes(contents)
    media_url = f"{settings.MEDIA_BASE_URL}{settings.MEDIA_URL_PREFIX}/{filename}"

    return AdvertisementService(db).create(media_url=media_url, media_type=media_type, link_url=link_url or None)


@admin_router.patch("/{advertisement_id}", response_model=AdvertisementOut)
def update_advertisement(advertisement_id: int, payload: AdvertisementUpdate, db: Session = Depends(get_db)):
    """Toggles is_active and/or edits the link URL for one banner."""
    advertisement = AdvertisementService(db).update(advertisement_id, **payload.model_dump(exclude_unset=True))
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return advertisement


@admin_router.post("/{advertisement_id}/move", response_model=AdvertisementOut)
def move_advertisement(advertisement_id: int, payload: AdvertisementMove, db: Session = Depends(get_db)):
    """Moves one banner up or down in the display sequence."""
    advertisement = AdvertisementService(db).move(advertisement_id, payload.direction)
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return advertisement


@admin_router.delete("/{advertisement_id}", status_code=204)
def delete_advertisement(advertisement_id: int, db: Session = Depends(get_db)):
    if not AdvertisementService(db).delete(advertisement_id):
        raise HTTPException(status_code=404, detail="Advertisement not found")
