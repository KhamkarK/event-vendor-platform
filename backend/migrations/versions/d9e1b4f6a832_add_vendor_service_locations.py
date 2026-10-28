"""add vendor service locations

Revision ID: d9e1b4f6a832
Revises: c8f3a6d0e4b7
Create Date: 2026-10-28 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd9e1b4f6a832'
down_revision: Union[str, None] = 'c8f3a6d0e4b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Other towns (besides the existing `location`) a vendor is also willing
    # to serve — see VendorService.search for how this is matched.
    op.add_column('vendor_profiles', sa.Column('service_locations', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('vendor_profiles', 'service_locations')
