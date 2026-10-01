"""add expenses table

Revision ID: f2a7c3e9b104
Revises: b6d3f9a1c274
Create Date: 2026-10-01 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'f2a7c3e9b104'
down_revision: Union[str, None] = 'b6d3f9a1c274'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('budget_allocation_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['budget_allocation_id'], ['budget_allocations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_expenses_id'), 'expenses', ['id'], unique=False)
    op.create_index(op.f('ix_expenses_event_id'), 'expenses', ['event_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_expenses_event_id'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_id'), table_name='expenses')
    op.drop_table('expenses')
