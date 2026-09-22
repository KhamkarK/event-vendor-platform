"""User-uploaded media. Currently just vendor package photos, but kept generic
(prefix `/uploads`) since other features may need image uploads later."""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.dependencies import require_vendor
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Content-type -> file extension. Deliberately a small allow-list rather than
# trusting the client-supplied filename.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("/image")
async def upload_image(file: UploadFile, current_user: User = Depends(require_vendor)):
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, WEBP, or GIF images are allowed",
        )

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image must be smaller than {settings.MAX_UPLOAD_MB}MB",
        )

    media_root = Path(settings.MEDIA_ROOT)
    media_root.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"
    (media_root / filename).write_bytes(contents)

    return {"url": f"{settings.MEDIA_BASE_URL}{settings.MEDIA_URL_PREFIX}/{filename}"}
