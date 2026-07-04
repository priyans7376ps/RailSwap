from __future__ import annotations

from functools import wraps

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    jwt_required,
)

from models.user_model import User
from utils.response import error_response


def generate_access_token(user, *, additional_claims: dict | None = None):
    additional_claims = additional_claims or {}
    role = getattr(user, "role", "user")
    return create_access_token(
        identity=str(user.id),
        additional_claims={"role": role, **additional_claims},
    )


def generate_refresh_token(user, *, additional_claims: dict | None = None):
    additional_claims = additional_claims or {}
    role = getattr(user, "role", "user")
    return create_refresh_token(
        identity=str(user.id),
        additional_claims={"role": role, **additional_claims},
    )


def current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id)) if user_id else None


def jwt_role_required(roles):
    """Decorator enforcing JWT role(s)."""

    if isinstance(roles, str):
        roles = [roles]

    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt() or {}
            role = claims.get("role")
            if role not in roles:
                return error_response("Forbidden", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def auth_required(fn):
    """Authenticates access token and injects current user."""

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return error_response("Authenticated user not found", 401)
        return fn(user, *args, **kwargs)

    return wrapper

