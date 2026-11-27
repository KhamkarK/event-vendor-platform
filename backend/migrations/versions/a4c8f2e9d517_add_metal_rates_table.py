"""add metal rates table

Revision ID: a4c8f2e9d517
Revises: e2c5f8a1b476
Create Date: 2026-11-27 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a4c8f2e9d517'
down_revision: Union[str, None] = 'e2c5f8a1b476'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'metal_rates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('gold_rate_per_10g', sa.Float(), nullable=True),
        sa.Column('silver_rate_per_kg', sa.Float(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_metal_rates_id'), 'metal_rates', ['id'], unique=False)
    # Single settings row (id=1) that MetalRateService always reads/writes, so
    # the service never special-cases "no row yet" -- only "rate not set".
    op.execute(sa.text("INSERT INTO metal_rates (id, gold_rate_per_10g, silver_rate_per_kg) VALUES (1, NULL, NULL)"))


def downgrade() -> None:
    op.drop_index(op.f('ix_metal_rates_id'), table_name='metal_rates')
    op.drop_table('metal_rates')
