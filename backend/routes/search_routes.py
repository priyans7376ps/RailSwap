from flask import Blueprint, request

from models.ticket_model import Ticket
from utils.jwt_helper import auth_required
from utils.response import success_response
from utils.validators import normalize_station, parse_date

search_bp = Blueprint("search", __name__)


@search_bp.get("/search")
@auth_required
def search_tickets(user):
    query = Ticket.query.filter(
        Ticket.ticket_status == "active",
        Ticket.verification_status == "verified",
        Ticket.owner_id != user.id,
    )

    source = request.args.get("source")
    destination = request.args.get("destination")
    journey_date = request.args.get("date")
    class_type = request.args.get("class")
    gender = request.args.get("gender")

    if source:
        query = query.filter(Ticket.source_station == normalize_station(source))
    if destination:
        query = query.filter(Ticket.destination_station == normalize_station(destination))
    if journey_date:
        parsed_date = parse_date(journey_date)
        query = query.filter(Ticket.journey_date == parsed_date) if parsed_date else query.filter(False)
    if class_type:
        query = query.filter(Ticket.class_type == class_type.upper())
    if gender and gender.lower() != "any":
        query = query.filter(Ticket.passenger_gender.in_([gender.lower(), "any"]))

    tickets = query.order_by(Ticket.journey_date.asc(), Ticket.exchange_price.asc()).all()
    return success_response("Tickets fetched", {"tickets": [ticket.to_dict() for ticket in tickets]})
