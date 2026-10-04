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

advertisement_media_type = sa.Enum('image', 'video', name='advertisement_media_type')


def upgrade() -> None:
    advertisement_media_type.create(op.get_bind(), checkfirst=True)
    op.create_table(
        'advertisements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('media_url', sa.String(length=500), nullable=False),
        sa.Column('media_type', advertisement_media_type, nullable=False),
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
    advertisement_media_type.drop(op.get_bind(), checkfirst=True)
