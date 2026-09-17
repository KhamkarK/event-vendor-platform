from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.event import EventCreate, EventOut, EventUpdate
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return EventService(db).create_event(current_user.id, payload)


@router.get("", response_model=list[EventOut])
def list_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return EventService(db).list_events(current_user.id)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return EventService(db).get_event(event_id, current_user.id)


@router.patch("/{event_id}", response_model=EventOut)
def update_event(event_id: int, payload: EventUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return EventService(db).update_event(event_id, current_user.id, payload)


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    EventService(db).delete_event(event_id, current_user.id)
