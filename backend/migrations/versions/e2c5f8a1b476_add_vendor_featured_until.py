"""add vendor featured until

Revision ID: e2c5f8a1b476
Revises: d9e1b4f6a832
Create Date: 2026-11-03 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e2c5f8a1b476'
down_revision: Union[str, None] = 'd9e1b4f6a832'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The date a vendor's admin-granted Premium status ends — see
    # VendorProfileOut's auto-expiry validator in app/schemas/user.py.
    op.add_column('vendor_profiles', sa.Column('featured_until', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('vendor_profiles', 'featured_until')
