"""add vendor profile url

Revision ID: b4e8f1a3c957
Revises: a7f3c9d1e825
Create Date: 2026-10-05 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b4e8f1a3c957'
down_revision: Union[str, None] = 'a7f3c9d1e825'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('vendor_profiles', sa.Column('profile_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('vendor_profiles', 'profile_url')
