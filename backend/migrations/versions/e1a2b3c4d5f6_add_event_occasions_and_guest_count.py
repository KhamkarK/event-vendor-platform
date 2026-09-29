"""add event occasion types and guest_count

Revision ID: e1a2b3c4d5f6
Revises: c7a9d1f3e685
Create Date: 2026-09-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e1a2b3c4d5f6'
down_revision: Union[str, None] = 'c7a9d1f3e685'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# New occasions offered on the Create Event dropdown, added to the existing
# MARRIAGE/BIRTHDAY/CORPORATE Postgres enum values (which are kept so
# existing events keep displaying correctly).
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
            op.execute(f"ALTER TYPE event_type ADD VALUE IF NOT EXISTS '{value}'")
    op.add_column('events', sa.Column('guest_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('events', 'guest_count')
    # Postgres does not support removing enum values, so the widened
    # event_type enum is intentionally left in place on downgrade.
