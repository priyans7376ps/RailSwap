from datetime import date
from flask import Blueprint, current_app, request

from config.database import db
from models.ticket_model import CLASS_TYPES, GENDERS, Ticket
from models.status_history_model import StatusHistory
from models.rating_model import Rating
from services.file_service import save_ticket_pdf
from services.pnr_service import verify_pnr
from utils.jwt_helper import auth_required, optional_auth
from utils.response import error_response, success_response
from utils.validators import normalize_station, parse_date, parse_decimal, required_fields, validate_pnr

ticket_bp = Blueprint("tickets", __name__)


def log_status_change(ticket_id, old_status, new_status, user_id=None, notes=None):
    try:
        sh = StatusHistory(
            ticket_id=ticket_id,
            old_status=old_status,
            new_status=new_status,
            changed_by_id=user_id,
            notes=notes
        )
        db.session.add(sh)
        db.session.commit()
    except Exception:
        db.session.rollback()


@ticket_bp.post("/create")
@auth_required
def create_ticket(user):
    payload = request.form.to_dict()
    missing = required_fields(
        payload,
        [
            "pnr_number",
            "train_number",
            "source_station",
            "destination_station",
            "journey_date",
            "class_type",
            "passenger_gender",
            "original_price",
            "exchange_price",
        ],
    )
    if missing:
        return error_response(missing, 400)
    if not validate_pnr(payload["pnr_number"]):
        return error_response("PNR must be a 10 digit number", 400)
    if Ticket.query.filter_by(pnr_number=payload["pnr_number"]).first():
        return error_response("Ticket with this PNR already exists", 409)

    journey_date = parse_date(payload["journey_date"])
    original_price = parse_decimal(payload["original_price"])
    exchange_price = parse_decimal(payload["exchange_price"])
    class_type = payload["class_type"].upper()
    gender = payload["passenger_gender"].lower()

    if not journey_date:
        return error_response("Invalid journey_date. Use YYYY-MM-DD", 400)
    if journey_date < date.today():
        return error_response("Journey date cannot be in the past", 400)
    if class_type not in CLASS_TYPES:
        return error_response(f"Invalid class_type. Allowed: {', '.join(CLASS_TYPES)}", 400)
    if gender not in GENDERS:
        return error_response(f"Invalid passenger_gender. Allowed: {', '.join(GENDERS)}", 400)
    if original_price is None or exchange_price is None:
        return error_response("Prices must be valid non-negative numbers", 400)
    if exchange_price > original_price:
        return error_response("Exchange price cannot exceed original price", 400)

    try:
        ticket_pdf = save_ticket_pdf(request.files.get("ticket_pdf"), current_app.config["UPLOAD_FOLDER"])
    except ValueError as exc:
        return error_response(str(exc), 400)

    # Authoritative RapidAPI PNR verification
    verification = verify_pnr(payload["pnr_number"])
    if not verification.get("verified"):
        return error_response(verification.get("message", "Invalid PNR number. Upload rejected."), 400)

    initial_verification_status = "verified"
    initial_ticket_status = "published"

    ticket = Ticket(
        owner_id=user.id,
        pnr_number=payload["pnr_number"],
        train_number=payload["train_number"].strip(),
        source_station=normalize_station(payload["source_station"]),
        destination_station=normalize_station(payload["destination_station"]),
        journey_date=journey_date,
        class_type=class_type,
        passenger_gender=gender,
        original_price=original_price,
        exchange_price=exchange_price,
        ticket_pdf=ticket_pdf,
        verification_status=initial_verification_status,
        ticket_status=initial_ticket_status,
    )
    db.session.add(ticket)
    db.session.commit()

    log_status_change(ticket.id, "draft", "published", user.id, "Ticket created and published")

    return success_response("Ticket listed successfully", {"ticket": ticket.to_dict()}, 201)


@ticket_bp.get("/mine")
@ticket_bp.get("/my-listings")
@auth_required
def get_my_listings(user):
    status_filter = request.args.get("status", "").lower()
    query = Ticket.query.filter_by(owner_id=user.id)

    if status_filter == "active":
        query = query.filter(Ticket.ticket_status.in_(["active", "published"]))
    elif status_filter == "pending":
        query = query.filter(Ticket.ticket_status == "pending_verification")
    elif status_filter == "matched":
        query = query.filter(Ticket.ticket_status.in_(["matched", "requested", "payment_pending"]))
    elif status_filter == "completed":
        query = query.filter(Ticket.ticket_status == "completed")
    elif status_filter == "expired":
        query = query.filter(Ticket.ticket_status == "expired")
    elif status_filter == "rejected":
        query = query.filter(Ticket.ticket_status == "rejected")

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return success_response("My listings fetched", {"tickets": [t.to_dict() for t in tickets]})


@ticket_bp.get("/<int:ticket_id>")
@ticket_bp.get("/<int:ticket_id>/details")
@optional_auth
def get_ticket_details(_user, ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    # Compute seller rating
    ratings = Rating.query.filter_by(rated_user_id=ticket.owner_id).all()
    avg_rating = sum([r.rating for r in ratings]) / len(ratings) if ratings else 5.0
    rating_count = len(ratings)

    # Status history
    histories = StatusHistory.query.filter_by(ticket_id=ticket.id).order_by(StatusHistory.created_at.desc()).all()

    data = ticket.to_dict()
    data["seller_rating"] = round(avg_rating, 1)
    data["seller_rating_count"] = rating_count
    data["status_history"] = [h.to_dict() for h in histories]

    return success_response("Listing details fetched", {"ticket": data})


@ticket_bp.post("/<int:ticket_id>/publish")
@auth_required
def publish_ticket(user, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, owner_id=user.id).first()
    if not ticket:
        return error_response("Ticket not found", 404)

    old_status = ticket.ticket_status
    ticket.ticket_status = "published"
    db.session.commit()

    log_status_change(ticket.id, old_status, "published", user.id, "User published listing")
    return success_response("Listing published successfully", {"ticket": ticket.to_dict()})


@ticket_bp.post("/<int:ticket_id>/deactivate")
@auth_required
def deactivate_ticket(user, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, owner_id=user.id).first()
    if not ticket:
        return error_response("Ticket not found", 404)

    old_status = ticket.ticket_status
    ticket.ticket_status = "draft"
    db.session.commit()

    log_status_change(ticket.id, old_status, "draft", user.id, "User deactivated listing")
    return success_response("Listing deactivated successfully", {"ticket": ticket.to_dict()})


@ticket_bp.post("/<int:ticket_id>/republish")
@auth_required
def republish_ticket(user, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, owner_id=user.id).first()
    if not ticket:
        return error_response("Ticket not found", 404)

    if ticket.journey_date < date.today():
        return error_response("Cannot republish an expired ticket", 400)

    old_status = ticket.ticket_status
    ticket.ticket_status = "published"
    db.session.commit()

    log_status_change(ticket.id, old_status, "published", user.id, "User republished listing")
    return success_response("Listing republished successfully", {"ticket": ticket.to_dict()})


@ticket_bp.delete("/<int:ticket_id>")
@auth_required
def delete_ticket(user, ticket_id):
    ticket = Ticket.query.filter_by(id=ticket_id, owner_id=user.id).first()
    if not ticket:
        return error_response("Ticket not found", 404)

    if ticket.ticket_status in ("matched", "payment_pending", "completed"):
        return error_response("Cannot delete ticket that has already been matched or completed", 400)

    db.session.delete(ticket)
    db.session.commit()
    return success_response("Listing deleted successfully")
