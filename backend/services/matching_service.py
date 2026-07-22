from datetime import timedelta
from models.ticket_model import Ticket
from utils.validators import normalize_station, parse_date


def gender_compatible(requested_gender, ticket_gender):
    if not requested_gender or requested_gender == "any":
        return True
    if not ticket_gender or ticket_gender == "any":
        return True
    return requested_gender.lower() == ticket_gender.lower()


def calculate_match_score(ticket, req_source, req_dest, req_date, req_class, req_gender):
    score = 0

    # 1. Source station match (Max 30)
    norm_req_src = normalize_station(req_source) if req_source else ""
    if norm_req_src and ticket.source_station == norm_req_src:
        score += 30

    # 2. Destination station match (Max 30)
    norm_req_dest = normalize_station(req_dest) if req_dest else ""
    if norm_req_dest and ticket.destination_station == norm_req_dest:
        score += 30

    # 3. Journey date proximity (Max 25)
    parsed_req_date = parse_date(req_date) if req_date else None
    if parsed_req_date and ticket.journey_date:
        diff_days = abs((ticket.journey_date - parsed_req_date).days)
        if diff_days == 0:
            score += 25
        elif diff_days <= 2:
            score += 15
        elif diff_days <= 5:
            score += 5

    # 4. Travel Class match (Max 10)
    if req_class and ticket.class_type == str(req_class).upper():
        score += 10

    # 5. Gender match (Max 5)
    if req_gender and req_gender != "any" and ticket.passenger_gender.lower() == req_gender.lower():
        score += 5

    return score


def find_matching_tickets(source, destination, journey_date, class_type=None, gender=None, exclude_owner_id=None):
    query = Ticket.query.filter(
        Ticket.ticket_status.in_(["active", "published"]),
        Ticket.verification_status == "verified",
    )

    if source:
        query = query.filter(Ticket.source_station == normalize_station(source))
    if destination:
        query = query.filter(Ticket.destination_station == normalize_station(destination))

    parsed_date = parse_date(journey_date) if journey_date else None
    if parsed_date:
        # Search range within +/- 3 days for maximum flexibility
        start_date = parsed_date - timedelta(days=3)
        end_date = parsed_date + timedelta(days=3)
        query = query.filter(Ticket.journey_date >= start_date, Ticket.journey_date <= end_date)

    if exclude_owner_id:
        query = query.filter(Ticket.owner_id != exclude_owner_id)

    requested_gender = str(gender).lower() if gender else None

    results = []
    for ticket in query.all():
        if not gender_compatible(requested_gender, ticket.passenger_gender):
            continue

        score = calculate_match_score(
            ticket=ticket,
            req_source=source,
            req_dest=destination,
            req_date=journey_date,
            req_class=class_type,
            req_gender=requested_gender,
        )

        ticket_dict = ticket.to_dict()
        ticket_dict["relevance_score"] = score
        results.append((score, ticket_dict))

    # Sort candidates by relevance score descending, then exchange price ascending
    results.sort(key=lambda x: (x[0], -x[1]["exchange_price"]), reverse=True)

    return [ticket_dict for score, ticket_dict in results]
