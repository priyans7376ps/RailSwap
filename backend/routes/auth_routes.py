from flask import Blueprint, request

from config.database import db
from models.user_model import User
from utils.jwt_helper import generate_token
from utils.response import error_response, success_response
from utils.validators import required_fields, validate_email, validate_password, validate_phone

auth_bp = Blueprint("auth", __name__)


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

    return success_response(
        "Registration successful",
        {"user": user.to_dict(), "access_token": generate_token(user)},
        201,
    )


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["email", "password"])
    if missing:
        return error_response(missing, 400)

    user = User.query.filter_by(email=payload["email"].lower()).first()
    if not user or not user.check_password(payload["password"]):
        return error_response("Invalid email or password", 401)

    return success_response(
        "Login successful",
        {"user": user.to_dict(), "access_token": generate_token(user)},
    )
