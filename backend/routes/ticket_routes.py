from flask import Blueprint, current_app, request

from config.database import db
from models.ticket_model import CLASS_TYPES, GENDERS, Ticket
from services.file_service import save_ticket_pdf
from services.pnr_service import verify_pnr
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import normalize_station, parse_date, parse_decimal, required_fields, validate_pnr

ticket_bp = Blueprint("tickets", __name__)


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

    from datetime import date
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

    # Initial verification check on PNR format and duplicate status
    verification = verify_pnr(payload["pnr_number"])
    initial_verification_status = "verified" if validate_pnr(payload["pnr_number"]) else "pending"

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
        ticket_status="active",
    )
    db.session.add(ticket)
    db.session.commit()

    return success_response("Ticket listed successfully", {"ticket": ticket.to_dict()}, 201)


@ticket_bp.get("/mine")
@auth_required
def get_my_tickets(user):
    tickets = Ticket.query.filter_by(owner_id=user.id).order_by(Ticket.created_at.desc()).all()
    return success_response("My tickets fetched", {"tickets": [t.to_dict() for t in tickets]})


@ticket_bp.get("/<int:ticket_id>")
@auth_required
def get_ticket(_user, ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)
    return success_response("Ticket fetched", {"ticket": ticket.to_dict()})
