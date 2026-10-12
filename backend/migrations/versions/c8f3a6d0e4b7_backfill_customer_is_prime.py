"""backfill is_prime for existing customers

Revision ID: c8f3a6d0e4b7
Revises: e5a1c3f7b908
Create Date: 2026-10-12 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'c8f3a6d0e4b7'
down_revision: Union[str, None] = 'e5a1c3f7b908'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Prime becomes free/default for every customer going forward (see
    # AuthService.signup); this one-time backfill brings existing customer
    # accounts in line so nobody is left on the old paid/admin-granted flag.
    op.execute("UPDATE users SET is_prime = true WHERE role = 'CUSTOMER' AND is_prime = false")


def downgrade() -> None:
    op.execute("UPDATE users SET is_prime = false WHERE role = 'CUSTOMER'")
