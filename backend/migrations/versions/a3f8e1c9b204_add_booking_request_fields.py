"""add booking request fields (requested_date, guest_count)

Revision ID: a3f8e1c9b204
Revises: f2a7c3e9b104
Create Date: 2026-10-01 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a3f8e1c9b204'
down_revision: Union[str, None] = 'f2a7c3e9b104'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('bookings', sa.Column('requested_date', sa.Date(), nullable=True))
    op.add_column('bookings', sa.Column('guest_count', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('bookings', 'guest_count')
    op.drop_column('bookings', 'requested_date')
