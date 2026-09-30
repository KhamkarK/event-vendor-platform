"""widen budget_categories event_type enum to match event occasions

Revision ID: b6d3f9a1c274
Revises: e1a2b3c4d5f6
Create Date: 2026-09-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b6d3f9a1c274'
down_revision: Union[str, None] = 'e1a2b3c4d5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# budget_categories.event_type was created (see 311e05e5545a) on its own
# Postgres enum type named "eventtype" — separate from the "event_type" type
# used by events.event_type, which e1a2b3c4d5f6 already widened. "eventtype"
# was never widened, so looking up budget category templates for any of the
# newer occasions raised "invalid input value for enum eventtype" after the
# event row was already committed. Add the same new values here too.
NEW_EVENT_TYPES = [
    "ANNIVERSARY",
    "BABY_SHOWER",
    "BACHELORETTE_PARTY",
    "BIRTHDAY_PARTY",
    "CONFERENCE",
    "CORPORATE_EVENTS",
    "DESTINATION_WEDDING",
    "ENGAGEMENT",
    "GRAHSHANTI",
    "HALDI_MEHENDI_CEREMONY",
    "RECEPTION_CEREMONY",
    "SANGEET_CEREMONY",
    "WEDDING_CEREMONY",
]


def upgrade() -> None:
    with op.get_context().autocommit_block():
        for value in NEW_EVENT_TYPES:
            op.execute(f"ALTER TYPE eventtype ADD VALUE IF NOT EXISTS '{value}'")


def downgrade() -> None:
    # Postgres does not support removing enum values, so the widened
    # eventtype enum is intentionally left in place on downgrade.
    pass
