"""Ensure all columns required by User model exist in SQLite.

This migration is designed to be idempotent on SQLite.
It will add missing columns even if earlier migration didn't run.
"""

from alembic import op

revision = "003_users_add_missing_columns"
down_revision = "001_user_role_fields"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    existing_cols = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}

    def add_col(col_name: str, col_ddl: str) -> None:
        if col_name in existing_cols:
            return
        op.execute(f"ALTER TABLE users ADD COLUMN {col_ddl}")
        existing_cols.add(col_name)

    add_col("role", "role VARCHAR(32) NOT NULL DEFAULT 'user'")
    add_col("rating", "rating NUMERIC(3, 2) NOT NULL DEFAULT 0")
    add_col("is_verified", "is_verified BOOLEAN NOT NULL DEFAULT 0")
    add_col("profile_image", "profile_image VARCHAR(255) NULL")
    add_col("created_at", "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")


def downgrade():
    pass

