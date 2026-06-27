from flask import Blueprint, request

from config.database import db
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import validate_email, validate_phone

user_bp = Blueprint("user", __name__)


@user_bp.get("/profile")
@auth_required
def get_profile(user):
    return success_response("Profile fetched", {"user": user.to_dict()})


@user_bp.put("/profile")
@auth_required
def update_profile(user):
    payload = request.get_json(silent=True) or {}

    if "email" in payload and not validate_email(payload["email"]):
        return error_response("Invalid email address", 400)
    if "phone" in payload and not validate_phone(payload["phone"]):
        return error_response("Invalid phone number", 400)

    for field in ("name", "email", "phone", "profile_image"):
        if field in payload:
            value = payload[field]
            setattr(user, field, value.lower() if field == "email" and value else value)

    db.session.commit()
    return success_response("Profile updated", {"user": user.to_dict()})
