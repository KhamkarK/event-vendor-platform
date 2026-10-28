from datetime import date, datetime, timedelta

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.event import EventType

# Customers may backdate an event by at most 2 days (e.g. logging one just
# held); anything older than that is rejected. Kept as a function (not a
# module-level constant) so the cutoff is evaluated per-request, not once at
# import time.
def _min_event_date() -> date:
    return date.today() - timedelta(days=2)


def _validate_not_too_far_past(value: date | None) -> date | None:
    if value is not None and value < _min_event_date():
        raise ValueError("Event date can't be more than 2 days in the past")
    return value


class EventCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    event_type: EventType
    event_date: date
    location: str = Field(min_length=2, max_length=255)
    total_budget: float = Field(gt=0)
    guest_count: int = Field(gt=0)

    _validate_event_date = field_validator("event_date")(_validate_not_too_far_past)


class EventUpdate(BaseModel):
    name: str | None = None
    event_date: date | None = None
    location: str | None = None
    total_budget: float | None = Field(default=None, gt=0)

    _validate_event_date = field_validator("event_date")(_validate_not_too_far_past)


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    event_type: EventType
    event_date: date
    location: str
    total_budget: float
    guest_count: int
    created_at: datetime
    updated_at: datetime
