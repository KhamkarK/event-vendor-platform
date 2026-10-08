"""add vendor profile urls

Revision ID: c5d9a2e7f134
Revises: b4e8f1a3c957
Create Date: 2026-10-08 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c5d9a2e7f134'
down_revision: Union[str, None] = 'b4e8f1a3c957'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('vendor_profiles', sa.Column('profile_urls', sa.JSON(), nullable=True))
    # Carry each vendor's existing single profile_url over as a one-item list;
    # the old column is left untouched. Links without a scheme get https://.
    op.execute(
        sa.text(
            """
            UPDATE vendor_profiles
            SET profile_urls = json_build_array(
                CASE WHEN btrim(profile_url) ~* '^https?://' THEN btrim(profile_url)
                     ELSE 'https://' || btrim(profile_url) END
            )
            WHERE profile_url IS NOT NULL AND btrim(profile_url) <> ''
            """
        )
    )


def downgrade() -> None:
    op.drop_column('vendor_profiles', 'profile_urls')
