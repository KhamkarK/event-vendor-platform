"""add vendor_blocked_dates table

Revision ID: a1f7c3e9b502
Revises: 9d4b6a2f0c1e
Create Date: 2026-09-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1f7c3e9b502'
down_revision: Union[str, None] = '9d4b6a2f0c1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('vendor_blocked_dates',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('vendor_id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['vendor_id'], ['vendor_profiles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('vendor_id', 'date', name='uq_vendor_blocked_date')
    )
    op.create_index(op.f('ix_vendor_blocked_dates_id'), 'vendor_blocked_dates', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vendor_blocked_dates_id'), table_name='vendor_blocked_dates')
    op.drop_table('vendor_blocked_dates')
