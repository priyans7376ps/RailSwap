from flask import Blueprint, request
from sqlalchemy import func

from config.database import db
from models.rating_model import Rating
from models.transaction_model import Transaction
from models.user_model import User
from services.notification_service import create_notification
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

rating_bp = Blueprint("rating", __name__)


@rating_bp.post("/submit")
@rating_bp.post("/create")
@auth_required
def submit_rating(user):
    payload = request.get_json(silent=True) or {}
    transaction_id = payload.get("transaction_id")
    to_user_id = payload.get("to_user") or payload.get("to_user_id")
    rating_val = payload.get("rating")
    review_text = payload.get("review") or payload.get("comment", "")

    if not rating_val:
        return error_response("Rating value is required", 400)

    txn = None
    if transaction_id:
        txn = Transaction.query.get(transaction_id)
        if txn:
            to_user_id = txn.seller_id if user.id == txn.buyer_id else txn.buyer_id

    if not to_user_id:
        return error_response("Target user to rate is required", 400)

    if int(to_user_id) == user.id:
        return error_response("Cannot rate yourself", 400)

    try:
        rating_value = int(rating_val)
    except (TypeError, ValueError):
        return error_response("Rating must be an integer from 1 to 5", 400)

    if rating_value < 1 or rating_value > 5:
        return error_response("Rating must be between 1 and 5", 400)

    to_user = User.query.get(to_user_id)
    if not to_user:
        return error_response("User to rate not found", 404)

    role_str = "buyer_to_seller" if txn and user.id == txn.buyer_id else "seller_to_buyer"

    # Create rating record
    rating = Rating(
        from_user=user.id,
        to_user=to_user.id,
        ticket_id=txn.ticket_id if txn else None,
        transaction_id=txn.id if txn else None,
        rating=rating_value,
        review=review_text.strip() if review_text else None,
        role=role_str
    )
    db.session.add(rating)
    db.session.flush()

    # Recalculate average rating for target user
    avg_rating = db.session.query(func.avg(Rating.rating)).filter(Rating.to_user == to_user.id).scalar()
    to_user.rating = round(float(avg_rating or 0), 2)
    db.session.commit()

    create_notification(
        user_id=to_user.id,
        title="New Rating Received",
        message=f"{user.name} rated you {rating_value}/5 stars!",
        type="system"
    )

    return success_response("Rating submitted successfully", {
        "rating": rating.to_dict(),
        "user_average_rating": float(to_user.rating)
    }, 201)


@rating_bp.get("/user/<int:user_id>")
def get_user_ratings(user_id):
    target = User.query.get(user_id)
    if not target:
        return error_response("User not found", 404)

    ratings = Rating.query.filter_by(to_user=user_id).order_by(Rating.created_at.desc()).all()
    return success_response("User ratings fetched", {
        "user_id": user_id,
        "average_rating": float(target.rating or 0),
        "total_reviews": len(ratings),
        "ratings": [r.to_dict() for r in ratings]
    })
