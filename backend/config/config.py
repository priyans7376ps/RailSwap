import os
from datetime import timedelta
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


def _coerce_bool(val: str) -> bool:
    return str(val).lower() in ("1", "true", "yes", "on")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    # JWT_SECRET_KEY MUST come from .env; if missing we fall back to SECRET_KEY.
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY", "change-me-in-production")

    # Always default to the repo's local SQLite DB to avoid schema drift.
    # Existing DB lives at backend/instance/railswap.db
    _default_sqlite_path = str(BASE_DIR / "instance" / "railswap.db")
    _default_sqlite_uri = f"sqlite:///{_default_sqlite_path}"

    # If DATABASE_URL is explicitly provided, we will use it.
    # We no longer hard-crash if the URL is not the default SQLite DB,
    # as production will likely use PostgreSQL.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", _default_sqlite_uri)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Access token lifetime
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440"))
    )

    # Refresh token lifetime
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
    )

    # Token rotation / cookie settings (used for httpOnly refresh cookies)
    JWT_REFRESH_COOKIE_NAME = os.getenv(
        "JWT_REFRESH_COOKIE_NAME", "refresh_token"
    )
    JWT_REFRESH_COOKIE_SECURE = _coerce_bool(
        os.getenv("JWT_REFRESH_COOKIE_SECURE", "true")
    )

    JWT_REFRESH_COOKIE_SAMESITE = os.getenv(
        "JWT_REFRESH_COOKIE_SAMESITE", "lax"
    )  # lax | strict | none
    JWT_REFRESH_COOKIE_DOMAIN = os.getenv("JWT_REFRESH_COOKIE_DOMAIN", "")

    # Comma-separated list of allowed origins.
    # NOTE: When cookies are used for auth refresh, you MUST set this explicitly (no '*').
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads" / "tickets"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH_BYTES", "5242880"))

    # ==========================
    # RailKit Configuration
    # ==========================
    RAILKIT_API_KEY = os.getenv("RAILKIT_API_KEY", "")
    RAILKIT_BASE_URL = os.getenv(
        "RAILKIT_BASE_URL",
        "https://railkit-api.rajivdubey.dev"
    )


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}