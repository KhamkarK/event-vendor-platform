"""add display_order to advertisements

Revision ID: d4f6a8c1b3e2
Revises: c5d9a2e7f134
Create Date: 2026-10-09 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd4f6a8c1b3e2'
down_revision: Union[str, None] = 'c5d9a2e7f134'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('advertisements', sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'))
    # Backfill existing rows so the pre-existing banner(s) keep their current
    # relative position (insertion/id order) once multiple banners can rotate.
    op.execute("UPDATE advertisements SET display_order = id")
    op.alter_column('advertisements', 'display_order', server_default=None)


def downgrade() -> None:
    op.drop_column('advertisements', 'display_order')
