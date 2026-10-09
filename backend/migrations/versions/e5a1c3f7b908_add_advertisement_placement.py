"""add placement to advertisements

Revision ID: e5a1c3f7b908
Revises: d4f6a8c1b3e2
Create Date: 2026-10-09 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = 'e5a1c3f7b908'
down_revision: Union[str, None] = 'd4f6a8c1b3e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Same duplicate_object guard as the advertisement_media_type enum
    # (a7f3c9d1e825) — avoids a re-run re-issuing CREATE TYPE.
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE advertisement_placement AS ENUM "
        "('top_banner', 'event_types_sidebar', 'event_types_bottom'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.add_column(
        'advertisements',
        sa.Column(
            'placement',
            postgresql.ENUM(
                'top_banner', 'event_types_sidebar', 'event_types_bottom',
                name='advertisement_placement', create_type=False,
            ),
            nullable=False,
            server_default='top_banner',
        ),
    )
    # Every banner that existed before this migration was the site-wide
    # top banner — the only placement that existed until now.
    op.alter_column('advertisements', 'placement', server_default=None)


def downgrade() -> None:
    op.drop_column('advertisements', 'placement')
    op.execute("DROP TYPE IF EXISTS advertisement_placement")
