"""Utilities to sync SQLite schema with current SQLAlchemy models.

This is used as a last-resort repair tool when migrations are missing or fail.
It ONLY adds missing columns to the existing SQLite DB and never drops tables.

Run:
    cd backend
    py utils/db_schema_sync.py
"""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from config.config import Config





REQUIRED_USER_COLUMNS = {
    # name: (DDL, sqlite_type)
    "role": "VARCHAR(32) NOT NULL DEFAULT 'user'",
    "rating": "NUMERIC(3, 2) NOT NULL DEFAULT 0",
    "is_verified": "BOOLEAN NOT NULL DEFAULT 0",
    "profile_image": "VARCHAR(255) NULL",
    "created_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
}


def _sqlite_db_path_from_uri(uri: str) -> str | None:
    # Supports: sqlite:///absolute/path OR sqlite:///relative/path
    if not uri.startswith("sqlite:///"):
        return None
    return uri.replace("sqlite:///", "", 1)


def sync_sqlite_users_table(db_uri: str) -> None:
    db_path = _sqlite_db_path_from_uri(db_uri)
    if not db_path:
        raise RuntimeError(f"Not a sqlite:/// database uri: {db_uri}")

    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        existing = {row[1] for row in cur.fetchall()}

        for col, ddl in REQUIRED_USER_COLUMNS.items():
            if col in existing:
                continue
            cur.execute(f"ALTER TABLE users ADD COLUMN {col} {ddl}")

        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    uri = os.getenv("DATABASE_URL") or Config.SQLALCHEMY_DATABASE_URI
    if not uri.startswith("sqlite:///"):
        print("Skipping: DB uri is not sqlite.")
        raise SystemExit(0)

    sync_sqlite_users_table(uri)
    print("SQLite users table schema synced successfully.")

