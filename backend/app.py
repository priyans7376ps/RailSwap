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
# Place backend/.env alongside this file (or override via an explicit env var).
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=str(_ENV_PATH))


jwt = JWTManager()



def create_app(config_name=None):
    app = Flask(__name__)
    env_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_name.get(env_name, config_by_name["development"]))

    # Startup logging to ensure signup/login operate on the same DB.
    # If you use DATABASE_URL, set it before starting the server.
    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
    active_jwt_secret = app.config.get("JWT_SECRET_KEY")

    # Print active SQLAlchemy DB URI during startup.
    app.logger.info(
        "Active SQLALCHEMY_DATABASE_URI=%s (FLASK_ENV=%s)",
        db_uri,
        env_name,
    )

    # Also log whether JWT secret is present (do not log secret value).
    app.logger.info(
        "JWT_SECRET_KEY loaded: %s",
        "yes" if active_jwt_secret else "no",
    )




    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    init_db(app)
    import models  # noqa: F401

    # Create tables automatically on startup.
    # This fixes "sqlite3.OperationalError: no such table: users" when using SQLite.
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.exception("Database initialization failed")
            raise e

    # JWT configuration (access/refresh cookies)
    app.config.setdefault("JWT_TOKEN_LOCATION", ["headers"])
    app.config.setdefault("JWT_ACCESS_TOKEN_EXPIRES", app.config.get("JWT_ACCESS_TOKEN_EXPIRES"))
    app.config.setdefault("JWT_REFRESH_TOKEN_EXPIRES", app.config.get("JWT_REFRESH_TOKEN_EXPIRES"))

    jwt.init_app(app)

    # Strict CORS: no wildcard origins when cookies/credentials are used.
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

    # Security headers (HelmetAction equivalent)
    @app.after_request
    def set_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault(
            "Referrer-Policy", "no-referrer"
        )
        response.headers.setdefault(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )
        # HSTS only for HTTPS in production
        if not app.config.get("DEBUG", False):
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )
        # Basic CSP; frontend serves most UI assets. Adjust as needed for Cloudinary domains.
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none'",
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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(ticket_bp, url_prefix="/api/tickets")
    app.register_blueprint(verification_bp, url_prefix="/api/ticket")
    app.register_blueprint(search_bp, url_prefix="/api/tickets")
    app.register_blueprint(matching_bp, url_prefix="/api/matching")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(rating_bp, url_prefix="/api/rating")


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
