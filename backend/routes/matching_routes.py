from flask import Blueprint, request

from services.matching_service import find_matching_tickets
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

matching_bp = Blueprint("matching", __name__)


@matching_bp.get("")
@matching_bp.get("/")
@matching_bp.get("/tickets")
@auth_required
def match_tickets(user):
    params = request.args.to_dict()
    source = params.get("source")
    destination = params.get("destination")
    date_val = params.get("date")
    class_val = params.get("class")

    if source and destination and date_val and class_val:
        tickets = find_matching_tickets(
            source,
            destination,
            date_val,
            class_val,
            params.get("gender"),
            exclude_owner_id=user.id,
        )
    else:
        # Generic match query: return active verified tickets available on marketplace not owned by user
        from models.ticket_model import Ticket
        query = Ticket.query.filter(
            Ticket.ticket_status == "active",
            Ticket.verification_status == "verified",
            Ticket.owner_id != user.id,
        )
        if source:
            from utils.validators import normalize_station
            query = query.filter(Ticket.source_station == normalize_station(source))
        if destination:
            from utils.validators import normalize_station
            query = query.filter(Ticket.destination_station == normalize_station(destination))
        
        tickets = query.order_by(Ticket.journey_date.asc(), Ticket.created_at.desc()).limit(20).all()

    return success_response("Matching tickets fetched", {"tickets": [ticket.to_dict() for ticket in tickets]})

