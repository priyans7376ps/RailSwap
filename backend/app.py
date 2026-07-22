import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from config.config import config_by_name
from config.database import db, init_db
from utils.response import error_response, success_response

# Load .env at application startup so config reads correct environment variables.
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=str(_ENV_PATH))

jwt = JWTManager()


def _apply_migrations_or_sync(app: Flask) -> None:
    """Apply Alembic migrations if possible; otherwise do safe SQLite sync."""

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")

    # Ensure models are imported so SQLAlchemy metadata is complete.
    import models  # noqa: F401

    with app.app_context():
        # Try Alembic / Flask-Migrate programmatically.
        try:
            from alembic import command
            from alembic.config import Config as AlembicConfig

            migrations_ini = Path(__file__).resolve().parent / "migrations" / "alembic.ini"
            alembic_cfg = (
                AlembicConfig(str(migrations_ini)) if migrations_ini.exists() else AlembicConfig()
            )

            alembic_cfg.set_main_option("sqlalchemy.url", db_uri)
            alembic_cfg.set_main_option(
                "script_location", str(Path(__file__).resolve().parent / "migrations")
            )

            # If there are multiple heads, upgrade without specifying head will fail.
            # Use 'heads' to upgrade all heads.
            command.upgrade(alembic_cfg, "heads")
            app.logger.info("Alembic migrations applied successfully")
            return
        except Exception as alembic_exc:
            app.logger.warning(
                "Alembic upgrade failed (%s). Falling back to safe SQLite sync.",
                alembic_exc,
            )

        from utils.db_schema_sync import sync_sqlite_users_table, sync_sqlite_tickets_table

        if db_uri and db_uri.startswith("sqlite:///"):
            sync_sqlite_tickets_table(db_uri)
            db.create_all()

        sync_sqlite_users_table(db_uri)
        app.logger.info("SQLite schema sync completed")


def _seed_admin_if_needed(app: Flask) -> None:
    with app.app_context():
        # Avoid seeding during explicit migration runs/commands.
        if os.getenv("FLASK_MIGRATIONS_RUNNING", "").lower() in ("1", "true", "yes"):
            return
        if os.getenv("FLASK_DB_COMMAND", ""):
            return

        from models.user_model import User

        admin_email = os.getenv("DEFAULT_ADMIN_EMAIL")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD")
        
        if not admin_email or not admin_password:
            return

        email_norm = admin_email.lower()

        admin_user = None
        try:
            admin_user = User.query.filter_by(email=email_norm).first()
        except Exception:
            admin_user = None

        if admin_user is None:
            admin_user = User(
                name="Admin",
                email=email_norm,
                phone=None,
                role="admin",
            )
            db.session.add(admin_user)

        admin_user.set_password(admin_password)
        admin_user.role = "admin"
        admin_user.name = admin_user.name or "Admin"
        db.session.commit()
        app.logger.info("Admin password synced successfully for %s", email_norm)

        db.session.commit()


def create_app(config_name=None):
    app = Flask(__name__)
    env_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_name.get(env_name, config_by_name["development"]))

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
    active_jwt_secret = app.config.get("JWT_SECRET_KEY")

    app.logger.info("Active SQLALCHEMY_DATABASE_URI=%s (FLASK_ENV=%s)", db_uri, env_name)
    app.logger.info("JWT_SECRET_KEY loaded: %s", "yes" if active_jwt_secret else "no")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    init_db(app)

    # Ensure schema is in sync (migrations preferred, safe sync fallback).
    _apply_migrations_or_sync(app)

    # Seed single admin account.
    _seed_admin_if_needed(app)

    # JWT configuration (access/refresh cookies)
    app.config.setdefault("JWT_TOKEN_LOCATION", ["headers"])
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", app.config.get("JWT_ACCESS_TOKEN_EXPIRES"))
    app.config.setdefault("JWT_REFRESH_TOKEN_EXPIRES", app.config.get("JWT_REFRESH_TOKEN_EXPIRES"))

    jwt.init_app(app)

    # CORS
    origins = app.config.get("CORS_ORIGINS", "*")
    origin_list = [o.strip() for o in origins.split(",") if o.strip()]
    allow_credentials = "*" not in origin_list

    CORS(
        app,
        resources={r"/api/*": {"origins": origin_list if origin_list != ["*"] else "*"}},
        supports_credentials=True if allow_credentials else False,
    )

    register_blueprints(app)
    register_error_handlers(app)

    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )
        if not app.config.get("DEBUG", False):
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data: https:; script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none'",
        )
        return response

    @app.get("/api/health")
    def health_check():
        return success_response("RailSwap backend is running")

    return app


def register_blueprints(app):
    from routes.auth_routes import auth_bp
    from routes.chat_routes import chat_bp
    from routes.matching_routes import matching_bp
    from routes.payment_routes import payment_bp
    from routes.rating_routes import rating_bp
    from routes.search_routes import search_bp
    from routes.ticket_routes import ticket_bp
    from routes.user_routes import user_bp
    from routes.verification_routes import verification_bp
    from routes.pnr_routes import pnr_bp
    from routes.admin_routes import admin_bp
    from routes.request_routes import request_bp
    from routes.bookmark_routes import bookmark_bp
    from routes.notification_routes import notification_bp
    from routes.report_routes import report_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(ticket_bp, url_prefix="/api/tickets")
    app.register_blueprint(pnr_bp, url_prefix="/api/pnr")
    app.register_blueprint(verification_bp, url_prefix="/api/ticket")
    app.register_blueprint(search_bp, url_prefix="/api/tickets")
    app.register_blueprint(matching_bp, url_prefix="/api/matching")
    app.register_blueprint(matching_bp, url_prefix="/api/matches", name="matches_bp")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(rating_bp, url_prefix="/api/rating")
    app.register_blueprint(request_bp, url_prefix="/api/requests")
    app.register_blueprint(bookmark_bp, url_prefix="/api/bookmarks")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    from routes.transaction_routes import transaction_bp

    app.register_blueprint(transaction_bp, url_prefix="/api/transactions")

    # Admin blueprint prefix required by the frontend.
    app.register_blueprint(admin_bp, url_prefix="/api/admin")


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(_):
        return error_response("Bad request", 400)

    @app.errorhandler(404)
    def not_found(_):
        return error_response("Resource not found", 404)

    @app.errorhandler(413)
    def payload_too_large(_):
        return error_response("Uploaded file is too large", 413)

    @app.errorhandler(Exception)
    def internal_error(error):
        app.logger.exception(error)
        return error_response("Internal server error", 500)


if __name__ == "__main__":
    create_app().run(use_reloader=False)
