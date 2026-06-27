from models.ticket_model import Ticket
from utils.validators import normalize_station, parse_date


def gender_compatible(requested_gender, ticket_gender):
    if not requested_gender or requested_gender == "any":
        return True
    if ticket_gender == "any":
        return True
    return requested_gender == ticket_gender


def find_matching_tickets(source, destination, journey_date, class_type, gender=None, exclude_owner_id=None):
    parsed_date = parse_date(journey_date)
    if not parsed_date:
        return []

    query = Ticket.query.filter(
        Ticket.source_station == normalize_station(source),
        Ticket.destination_station == normalize_station(destination),
        Ticket.journey_date == parsed_date,
        Ticket.class_type == str(class_type).upper(),
        Ticket.ticket_status == "active",
        Ticket.verification_status == "verified",
    )

    if exclude_owner_id:
        query = query.filter(Ticket.owner_id != exclude_owner_id)

    requested_gender = str(gender).lower() if gender else None
    return [
        ticket
        for ticket in query.order_by(Ticket.exchange_price.asc()).all()
        if gender_compatible(requested_gender, ticket.passenger_gender)
    ]
