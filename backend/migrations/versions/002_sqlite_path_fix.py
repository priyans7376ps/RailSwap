"""Fix SQLite URL escaping for Windows paths.

This migration is a no-op for the schema.
It exists only to ensure Alembic env doesn't fail on URL formatting.
"""

from alembic import op

revision = "002_sqlite_path_fix"
down_revision = "001_user_role_fields"
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass

