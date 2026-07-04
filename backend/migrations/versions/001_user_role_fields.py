"""Add missing columns required by User model.

This migration is designed to be safe on existing SQLite databases:
- It checks whether each column exists before adding it.
- It does not drop or recreate tables.

It fixes schema drift causing errors like:
`sqlite3.OperationalError: no such column: users.role`.

Revision ID: 001_user_role_fields
Revises: 
Create Date: 2026-07-17
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "001_user_role_fields"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    existing_cols = {
        row[1]
        for row in conn.execute("PRAGMA table_info(users)").fetchall()
    }

    def add_col(col_name: str, col_ddl: str) -> None:
        if col_name in existing_cols:
            return
        op.execute(f"ALTER TABLE users ADD COLUMN {col_ddl}")
        existing_cols.add(col_name)

    # New fields introduced in the User model
    add_col("role", "role VARCHAR(32) NOT NULL DEFAULT 'user'")
    add_col("rating", "rating NUMERIC(3, 2) NOT NULL DEFAULT 0")
    add_col("is_verified", "is_verified BOOLEAN NOT NULL DEFAULT 0")
    add_col("profile_image", "profile_image VARCHAR(255) NULL")
    add_col("created_at", "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")


def downgrade():
    # Removing columns in SQLite is not safe; keep as no-op.
    pass

