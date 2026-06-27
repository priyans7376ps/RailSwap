import os

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config.config import config_by_name
from config.database import db, init_db
from utils.response import error_response, success_response

jwt = JWTManager()


def create_app(config_name=None):
    app = Flask(__name__)
    env_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_name.get(env_name, config_by_name["development"]))

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

    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    register_blueprints(app)
    register_error_handlers(app)

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
