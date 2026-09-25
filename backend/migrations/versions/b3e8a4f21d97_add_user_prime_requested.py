"""add prime_requested flag to users

Revision ID: b3e8a4f21d97
Revises: a1f7c3e9b502
Create Date: 2026-09-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b3e8a4f21d97'
down_revision: Union[str, None] = 'a1f7c3e9b502'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('prime_requested', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('users', 'prime_requested')
