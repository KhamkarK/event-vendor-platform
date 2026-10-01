from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.event import Event
from app.repositories.event_repository import EventRepository
from app.schemas.event import EventCreate, EventUpdate

# Fallback templates used to auto-generate budget categories when no
# BudgetCategory rows have been seeded yet for a given event type.
DEFAULT_CATEGORY_TEMPLATES: dict[str, list[dict]] = {
    "marriage": [
        {"name": "Attire & Shopping", "icon": "shirt", "default_percentage": 15},
        {"name": "Venue Booking", "icon": "landmark", "default_percentage": 25},
        {"name": "Catering & Decoration", "icon": "utensils", "default_percentage": 30},
        {"name": "Photography & Makeup", "icon": "camera", "default_percentage": 15},
        {"name": "Travel & Honeymoon", "icon": "plane", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "birthday": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering & Cake", "icon": "cake", "default_percentage": 30},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 10},
        {"name": "Gifts & Favors", "icon": "gift", "default_percentage": 10},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "corporate": [
        {"name": "Venue & AV Setup", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Branding & Print", "icon": "badge", "default_percentage": 15},
        {"name": "Speakers & Talent", "icon": "mic", "default_percentage": 15},
        {"name": "Logistics & Travel", "icon": "plane", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    # Occasions added to the Create Event dropdown alongside the three
    # legacy types above. "wedding-ceremony", "birthday-party" and
    # "corporate-events" reuse the legacy templates they supersede.
    "wedding-ceremony": [
        {"name": "Attire & Shopping", "icon": "shirt", "default_percentage": 15},
        {"name": "Venue Booking", "icon": "landmark", "default_percentage": 25},
        {"name": "Catering & Decoration", "icon": "utensils", "default_percentage": 30},
        {"name": "Photography & Makeup", "icon": "camera", "default_percentage": 15},
        {"name": "Travel & Honeymoon", "icon": "plane", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "birthday-party": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering & Cake", "icon": "cake", "default_percentage": 30},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 10},
        {"name": "Gifts & Favors", "icon": "gift", "default_percentage": 10},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "corporate-events": [
        {"name": "Venue & AV Setup", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Branding & Print", "icon": "badge", "default_percentage": 15},
        {"name": "Speakers & Talent", "icon": "mic", "default_percentage": 15},
        {"name": "Logistics & Travel", "icon": "plane", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "bachelorette-party": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 25},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 15},
        {"name": "Travel & Stay", "icon": "plane", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "destination-wedding": [
        {"name": "Venue & Stay", "icon": "landmark", "default_percentage": 30},
        {"name": "Travel & Logistics", "icon": "plane", "default_percentage": 20},
        {"name": "Catering & Decoration", "icon": "utensils", "default_percentage": 25},
        {"name": "Photography", "icon": "camera", "default_percentage": 15},
        {"name": "Attire & Shopping", "icon": "shirt", "default_percentage": 10},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "grahshanti": [
        {"name": "Pandit & Rituals", "icon": "sparkles", "default_percentage": 35},
        {"name": "Catering", "icon": "utensils", "default_percentage": 30},
        {"name": "Decoration", "icon": "landmark", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 15},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "haldi-mehendi-ceremony": [
        {"name": "Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Mehendi & Grooming", "icon": "sparkles", "default_percentage": 25},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "reception-ceremony": [
        {"name": "Venue Booking", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering & Decoration", "icon": "utensils", "default_percentage": 30},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "sangeet-ceremony": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 25},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "engagement": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 25},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Attire & Shopping", "icon": "shirt", "default_percentage": 15},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 10},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "anniversary": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering", "icon": "utensils", "default_percentage": 30},
        {"name": "Entertainment", "icon": "party-popper", "default_percentage": 20},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "conference": [
        {"name": "Venue & AV Setup", "icon": "landmark", "default_percentage": 35},
        {"name": "Catering", "icon": "utensils", "default_percentage": 20},
        {"name": "Branding & Print", "icon": "badge", "default_percentage": 15},
        {"name": "Speakers & Talent", "icon": "mic", "default_percentage": 20},
        {"name": "Logistics & Travel", "icon": "plane", "default_percentage": 10},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
    "baby-shower": [
        {"name": "Venue & Decoration", "icon": "landmark", "default_percentage": 30},
        {"name": "Catering & Cake", "icon": "cake", "default_percentage": 30},
        {"name": "Photography", "icon": "camera", "default_percentage": 20},
        {"name": "Gifts & Favors", "icon": "gift", "default_percentage": 20},
        {"name": "Other", "icon": "more-horizontal", "default_percentage": 0},
    ],
}


class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.events = EventRepository(db)

    def create_event(self, user_id: int, payload: EventCreate) -> Event:
        event = Event(
            user_id=user_id,
            name=payload.name,
            event_type=payload.event_type,
            event_date=payload.event_date,
            location=payload.location,
            total_budget=payload.total_budget,
            guest_count=payload.guest_count,
        )
        event = self.events.create(event)
        self._auto_generate_allocations(event)
        return event

    def _auto_generate_allocations(self, event: Event) -> None:
        from app.models.budget import BudgetAllocation

        templates = self.events.get_category_templates(event.event_type)
        if templates:
            source = [
                {"name": t.name, "icon": t.icon, "default_percentage": t.default_percentage, "sort_order": t.sort_order}
                for t in templates
            ]
        else:
            source = [
                {**item, "sort_order": idx}
                for idx, item in enumerate(DEFAULT_CATEGORY_TEMPLATES.get(event.event_type.value, []))
            ]

        for item in source:
            allocated = round(event.total_budget * (item["default_percentage"] / 100), 2)
            self.events.create_allocation(
                BudgetAllocation(
                    event_id=event.id,
                    name=item["name"],
                    icon=item["icon"],
                    allocated_amount=allocated,
                    sort_order=item["sort_order"],
                )
            )
        self.events.commit()

    def get_event(self, event_id: int, user_id: int) -> Event:
        event = self.events.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event

    def list_events(self, user_id: int) -> list[Event]:
        return self.events.list_by_user(user_id)

    def update_event(self, event_id: int, user_id: int, payload: EventUpdate) -> Event:
        event = self.get_event(event_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(event, field, value)
        return self.events.update(event)

    def delete_event(self, event_id: int, user_id: int) -> None:
        event = self.get_event(event_id, user_id)
        self.events.delete(event)
