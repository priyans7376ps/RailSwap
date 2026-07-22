from __future__ import annotations

import os
import sqlite3
from pathlib import Path

from config.config import Config

REQUIRED_USER_COLUMNS = {
    "role": "VARCHAR(32) NOT NULL DEFAULT 'user'",
    "status": "VARCHAR(20) NOT NULL DEFAULT 'active'",
    "rating": "NUMERIC(3, 2) NOT NULL DEFAULT 0",
    "is_verified": "BOOLEAN NOT NULL DEFAULT 0",
    "profile_image": "VARCHAR(255) NULL",
    "created_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
}

REQUIRED_MESSAGE_COLUMNS = {
    "conversation_id": "INTEGER NULL",
    "is_read": "BOOLEAN NOT NULL DEFAULT 0",
    "read_at": "DATETIME NULL",
}

REQUIRED_TRANSACTION_COLUMNS = {
    "exchange_request_id": "INTEGER NULL",
    "seller_amount": "NUMERIC(10, 2) NOT NULL DEFAULT 0",
    "updated_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
}

REQUIRED_RATING_COLUMNS = {
    "ticket_id": "INTEGER NULL",
    "transaction_id": "INTEGER NULL",
    "role": "VARCHAR(30) NULL",
}


def _sqlite_db_path_from_uri(uri: str) -> str | None:
    if not uri.startswith("sqlite:///"):
        return None
    return uri.replace("sqlite:///", "", 1)


def sync_sqlite_users_table(db_uri: str) -> None:
    db_path = _sqlite_db_path_from_uri(db_uri)
    if not db_path:
        return

    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(users)")
            existing = {row[1] for row in cur.fetchall()}

            for col, ddl in REQUIRED_USER_COLUMNS.items():
                if col not in existing:
                    cur.execute(f"ALTER TABLE users ADD COLUMN {col} {ddl}")

        conn.commit()
    finally:
        conn.close()


def sync_sqlite_tickets_table(db_uri: str) -> None:
    """Re-creates or repairs tables if check constraints/columns are outdated in SQLite."""
    db_path = _sqlite_db_path_from_uri(db_uri)
    if not db_path or not Path(db_path).exists():
        return

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='tickets'")
        row = cur.fetchone()
        if row and row[0] and "check_ticket_status" in row[0]:
            sql = row[0]
            if "'requested'" not in sql or "'rejected'" not in sql:
                cur.execute("DROP TABLE IF EXISTS exchange_requests")
                cur.execute("DROP TABLE IF EXISTS status_histories")
                cur.execute("DROP TABLE IF EXISTS tickets")

        cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'")
        t_row = cur.fetchone()
        if t_row and t_row[0] and "check_payment_status" in t_row[0]:
            t_sql = t_row[0]
            if "'payment_held'" not in t_sql:
                cur.execute("DROP TABLE IF EXISTS payments")
                cur.execute("DROP TABLE IF EXISTS transaction_timelines")
                cur.execute("DROP TABLE IF EXISTS transactions")

        # Sync missing columns in messages table
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(messages)")
            existing_m = {r[1] for r in cur.fetchall()}
            for col, ddl in REQUIRED_MESSAGE_COLUMNS.items():
                if col not in existing_m:
                    cur.execute(f"ALTER TABLE messages ADD COLUMN {col} {ddl}")

        # Sync missing columns in transactions table
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(transactions)")
            existing_t = {r[1] for r in cur.fetchall()}
            for col, ddl in REQUIRED_TRANSACTION_COLUMNS.items():
                if col not in existing_t:
                    cur.execute(f"ALTER TABLE transactions ADD COLUMN {col} {ddl}")

        # Sync missing columns in ratings table
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ratings'")
        if cur.fetchone():
            cur.execute("PRAGMA table_info(ratings)")
            existing_r = {r[1] for r in cur.fetchall()}
            for col, ddl in REQUIRED_RATING_COLUMNS.items():
                if col not in existing_r:
                    cur.execute(f"ALTER TABLE ratings ADD COLUMN {col} {ddl}")

        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()


if __name__ == "__main__":
    uri = os.getenv("DATABASE_URL") or Config.SQLALCHEMY_DATABASE_URI
    if uri.startswith("sqlite:///"):
        sync_sqlite_users_table(uri)
        sync_sqlite_tickets_table(uri)
        print("SQLite schema synced successfully.")
