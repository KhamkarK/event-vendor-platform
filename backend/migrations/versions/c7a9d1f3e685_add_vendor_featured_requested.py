"""add featured_requested flag to vendor_profiles

Revision ID: c7a9d1f3e685
Revises: b3e8a4f21d97
Create Date: 2026-09-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c7a9d1f3e685'
down_revision: Union[str, None] = 'b3e8a4f21d97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('vendor_profiles', sa.Column('featured_requested', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('vendor_profiles', 'featured_requested')
