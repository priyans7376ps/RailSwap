from functools import wraps

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from models.user_model import User
from utils.response import error_response


def generate_token(user):
    return create_access_token(identity=str(user.id))


def current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id)) if user_id else None


def auth_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return error_response("Authenticated user not found", 401)
        return fn(user, *args, **kwargs)

    return wrapper
