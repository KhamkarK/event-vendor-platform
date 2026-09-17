from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.event import EventType


class EventCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    event_type: EventType
    event_date: date
    location: str = Field(min_length=2, max_length=255)
    total_budget: float = Field(gt=0)


class EventUpdate(BaseModel):
    name: str | None = None
    event_date: date | None = None
    location: str | None = None
    total_budget: float | None = Field(default=None, gt=0)


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    event_type: EventType
    event_date: date
    location: str
    total_budget: float
    created_at: datetime
    updated_at: datetime
