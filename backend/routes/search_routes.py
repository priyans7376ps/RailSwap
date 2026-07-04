from flask import Blueprint, request

from config.database import db
from models.ticket_model import Ticket
from models.search_history_model import SearchHistory
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
    train_number = request.args.get("train_number")
    price_min = request.args.get("price_min")
    price_max = request.args.get("price_max")
    sort_by = request.args.get("sort_by", "journey_date") # price_asc, price_desc, latest

    search_params = {}

    if source:
        search_params["source"] = source
        query = query.filter(Ticket.source_station == normalize_station(source))
    if destination:
        search_params["destination"] = destination
        query = query.filter(Ticket.destination_station == normalize_station(destination))
    if journey_date:
        search_params["date"] = journey_date
        parsed_date = parse_date(journey_date)
        query = query.filter(Ticket.journey_date == parsed_date) if parsed_date else query.filter(False)
    if class_type:
        search_params["class"] = class_type
        query = query.filter(Ticket.class_type == class_type.upper())
    if gender and gender.lower() != "any":
        search_params["gender"] = gender
        query = query.filter(Ticket.passenger_gender.in_([gender.lower(), "any"]))
    if train_number:
        search_params["train_number"] = train_number
        query = query.filter(Ticket.train_number == train_number)
    if price_min:
        query = query.filter(Ticket.exchange_price >= float(price_min))
    if price_max:
        query = query.filter(Ticket.exchange_price <= float(price_max))

    if sort_by == "price_asc":
        query = query.order_by(Ticket.exchange_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Ticket.exchange_price.desc())
    elif sort_by == "latest":
        query = query.order_by(Ticket.created_at.desc())
    else:
        query = query.order_by(Ticket.journey_date.asc(), Ticket.exchange_price.asc())

    # Log search history if there are any meaningful params
    if search_params:
        history = SearchHistory(user_id=user.id, search_query=search_params)
        db.session.add(history)
        db.session.commit()

    tickets = query.all()
    return success_response("Tickets fetched", {"tickets": [ticket.to_dict() for ticket in tickets]})


@search_bp.get("/search/history")
@auth_required
def get_search_history(user):
    history = SearchHistory.query.filter_by(user_id=user.id).order_by(SearchHistory.created_at.desc()).limit(10).all()
    return success_response("Search history fetched", {"history": [h.to_dict() for h in history]})

@search_bp.delete("/search/history")
@auth_required
def clear_search_history(user):
    SearchHistory.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return success_response("Search history cleared")
