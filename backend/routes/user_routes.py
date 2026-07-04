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


@user_bp.get("/dashboard/summary")
@auth_required
def get_dashboard_summary(user):
    from models.ticket_model import Ticket
    from models.ticket_request_model import TicketRequest
    
    active_tickets = Ticket.query.filter_by(owner_id=user.id, ticket_status="active").count()
    completed_tickets = Ticket.query.filter_by(owner_id=user.id, ticket_status="completed").count()
    active_requests = TicketRequest.query.filter_by(buyer_id=user.id, status="active").count()
    
    # We could fetch more stats here based on the models
    
    summary = {
        "active_tickets": active_tickets,
        "completed_tickets": completed_tickets,
        "active_requests": active_requests,
        "trust_score": float(user.trust_score or 100.0),
        "completed_exchanges": user.completed_exchanges,
        "cancelled_exchanges": user.cancelled_exchanges
    }
    
    return success_response("Dashboard summary fetched", summary)
