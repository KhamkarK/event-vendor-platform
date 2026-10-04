"""add advertisements table

Revision ID: a7f3c9d1e825
Revises: a3f8e1c9b204
Create Date: 2026-10-04 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a7f3c9d1e825'
down_revision: Union[str, None] = 'a3f8e1c9b204'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Raw SQL + exception guard rather than Enum.create(checkfirst=True): a
    # prior failed deploy left this type behind without the table (see the
    # "already exists" incident this migration was rewritten to fix), and
    # SQLAlchemy's checkfirst existence check wasn't reliably detecting that
    # here — this Postgres-native idiom catches "already exists" directly
    # instead of depending on that pre-check. The column below passes
    # create_type=False so op.create_table doesn't also try to create it.
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE advertisement_media_type AS ENUM ('image', 'video'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.create_table(
        'advertisements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('media_url', sa.String(length=500), nullable=False),
        sa.Column('media_type', sa.Enum('image', 'video', name='advertisement_media_type', create_type=False), nullable=False),
        sa.Column('link_url', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_advertisements_id'), 'advertisements', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_advertisements_id'), table_name='advertisements')
    op.drop_table('advertisements')
    op.execute("DROP TYPE IF EXISTS advertisement_media_type")
