"""seed initial admin user

Revision ID: 7c2f9b4a1d3e
Revises: 311e05e5545a
Create Date: 2026-09-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.security import hash_password

# revision identifiers, used by Alembic.
revision: str = '7c2f9b4a1d3e'
down_revision: Union[str, None] = '311e05e5545a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin123"


def upgrade() -> None:
    # Plain sa.table()/insert() binds "role" as VARCHAR, which Postgres
    # refuses to implicitly cast into the "user_role" enum column created
    # by the initial migration — so this uses raw SQL with an explicit
    # CAST(... AS user_role) instead.
    op.execute(
        sa.text(
            """
            INSERT INTO users
                (username, email, full_name, hashed_password, role, is_active, is_email_verified, is_mobile_verified)
            VALUES
                (:username, :email, :full_name, :hashed_password, CAST(:role AS user_role), :is_active, :is_email_verified, :is_mobile_verified)
            """
        ).bindparams(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            full_name="Administrator",
            hashed_password=hash_password(ADMIN_PASSWORD),
            # Matches the label stored by the existing "user_role" Postgres
            # enum (SQLAlchemy stores the Python Enum member's .name here,
            # not UserRole.ADMIN.value).
            role="ADMIN",
            is_active=True,
            is_email_verified=False,
            is_mobile_verified=False,
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM users WHERE username = :username").bindparams(username=ADMIN_USERNAME))
