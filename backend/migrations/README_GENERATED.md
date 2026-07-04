# Notes

This repo did not include generated Alembic migration scripts under `backend/migrations/versions`.
To fix schema drift between the SQLAlchemy models and the existing local SQLite DB
(`backend/instance/railswap.db`), a minimal migration was added:

- `versions/001_user_role_fields.py`

It adds any missing `users` columns required by `models/user_model.py` without dropping tables.

This is safe for existing data and is intended to resolve errors like:

`sqlite3.OperationalError: no such column: users.role`

