from flask import Blueprint, request
from sqlalchemy import func

from config.database import db
from models.rating_model import Rating
from models.user_model import User
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

rating_bp = Blueprint("rating", __name__)


@rating_bp.post("/create")
@auth_required
def create_rating(user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["to_user", "rating"])
    if missing:
        return error_response(missing, 400)

    to_user = User.query.get(payload["to_user"])
    if not to_user:
        return error_response("User to rate not found", 404)
    if to_user.id == user.id:
        return error_response("Cannot rate yourself", 400)

    try:
        rating_value = int(payload["rating"])
    except (TypeError, ValueError):
        return error_response("Rating must be an integer from 1 to 5", 400)
    if rating_value < 1 or rating_value > 5:
        return error_response("Rating must be from 1 to 5", 400)

    rating = Rating(
        from_user=user.id,
        to_user=to_user.id,
        rating=rating_value,
        review=payload.get("review"),
    )
    db.session.add(rating)
    db.session.flush()

    average_rating = db.session.query(func.avg(Rating.rating)).filter(Rating.to_user == to_user.id).scalar()
    to_user.rating = average_rating or 0
    db.session.commit()

    return success_response("Rating created", {"rating": rating.to_dict(), "user": to_user.to_dict()}, 201)
