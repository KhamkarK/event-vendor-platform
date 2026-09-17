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
    users_table = sa.table(
        "users",
        sa.column("username", sa.String),
        sa.column("email", sa.String),
        sa.column("full_name", sa.String),
        sa.column("hashed_password", sa.String),
        sa.column("role", sa.String),
        sa.column("is_active", sa.Boolean),
        sa.column("is_email_verified", sa.Boolean),
        sa.column("is_mobile_verified", sa.Boolean),
    )
    op.execute(
        users_table.insert().values(
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
