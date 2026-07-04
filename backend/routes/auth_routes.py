from flask import Blueprint, request

from config.database import db
from models.user_model import User
from flask import current_app, make_response

from utils.jwt_helper import (
    generate_access_token,
    generate_refresh_token,
)
from utils.response import error_response, success_response
from utils.validators import required_fields, validate_email, validate_password, validate_phone

auth_bp = Blueprint("auth", __name__)


def _clear_refresh_cookie(resp):
    resp.set_cookie(
        current_app.config["JWT_REFRESH_COOKIE_NAME"],
        "",
        httponly=True,
        secure=current_app.config["JWT_REFRESH_COOKIE_SECURE"],
        samesite=current_app.config["JWT_REFRESH_COOKIE_SAMESITE"],
        domain=current_app.config.get("JWT_REFRESH_COOKIE_DOMAIN") or None,
        max_age=0,
        path="/",
    )
    return resp


@auth_bp.post("/refresh")
def refresh():
    """Issue a new access token using the httpOnly refresh cookie."""

    # Proper refresh wiring will be added next; for now we return not implemented.
    return error_response("Refresh flow not implemented", 501)



@auth_bp.post("/logout")
def logout():
    resp = success_response("Logged out")
    _clear_refresh_cookie(resp)
    return resp


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["name", "email", "password"])
    if missing:
        return error_response(missing, 400)
    if not validate_email(payload["email"]):
        return error_response("Invalid email address", 400)
    if not validate_password(payload["password"]):
        return error_response("Password must be at least 8 characters", 400)
    if not validate_phone(payload.get("phone")):
        return error_response("Invalid phone number", 400)
    if User.query.filter_by(email=payload["email"].lower()).first():
        return error_response("Email is already registered", 409)

    user = User(
        name=payload["name"].strip(),
        email=payload["email"].lower(),
        phone=payload.get("phone"),
    )
    user.set_password(payload["password"])
    db.session.add(user)
    db.session.commit()

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    resp = make_response(success_response(
        "Registration successful",
        {"user": user.to_dict(), "access_token": access_token},
        201,
    ))

    # httpOnly refresh cookie (prevents JS token theft)
    max_age_seconds = int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"].total_seconds())
    resp.set_cookie(
        current_app.config["JWT_REFRESH_COOKIE_NAME"],
        refresh_token,
        httponly=True,
        secure=current_app.config["JWT_REFRESH_COOKIE_SECURE"],
        samesite=current_app.config["JWT_REFRESH_COOKIE_SAMESITE"],
        domain=current_app.config.get("JWT_REFRESH_COOKIE_DOMAIN") or None,
        max_age=max_age_seconds,
        path="/",
    )

    return resp


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["email", "password"])
    if missing:
        return error_response(missing, 400)

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")

    # Debug logging (never log raw password)
    current_app.logger.info("LOGIN attempt received for email=%s", email)

    user = User.query.filter_by(email=email).first()
    if not user:
        current_app.logger.info("LOGIN failed: email not found for email=%s", email)
        return error_response("Invalid email or password", 401)

    ok = user.check_password(password)
    current_app.logger.info(
        "LOGIN password verification %s for user_id=%s email=%s",
        "passed" if ok else "failed",
        user.id,
        email,
    )

    if not ok:
        return error_response("Invalid email or password", 401)

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)


    resp = make_response(success_response(
        "Login successful",
        {"user": user.to_dict(), "access_token": access_token},
    ))

    # httpOnly refresh cookie (prevents JS token theft)
    max_age_seconds = int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"].total_seconds())
    resp.set_cookie(
        current_app.config["JWT_REFRESH_COOKIE_NAME"],
        refresh_token,
        httponly=True,
        secure=current_app.config["JWT_REFRESH_COOKIE_SECURE"],
        samesite=current_app.config["JWT_REFRESH_COOKIE_SAMESITE"],
        domain=current_app.config.get("JWT_REFRESH_COOKIE_DOMAIN") or None,
        max_age=max_age_seconds,
        path="/",
    )

    return resp
