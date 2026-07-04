from models.ticket_model import Ticket
from utils.validators import normalize_station, parse_date


def gender_compatible(requested_gender, ticket_gender):
    if not requested_gender or requested_gender == "any":
        return True
    if ticket_gender == "any":
        return True
    return requested_gender == ticket_gender


def calculate_match_score(ticket, requested_class, requested_gender):
    score = 0
    # Base mandatory (source, dest, date) is already filtered
    score += 100 
    
    # Same Class
    if requested_class and ticket.class_type == str(requested_class).upper():
        score += 20
        
    # Same Gender
    if requested_gender and requested_gender != "any":
        if ticket.passenger_gender.lower() == requested_gender:
            score += 10
            
    # Time/Seat (placeholder for future)
    
    return score

def find_matching_tickets(source, destination, journey_date, class_type, gender=None, exclude_owner_id=None):
    parsed_date = parse_date(journey_date)
    if not parsed_date:
        return []

    # Get all potential matches for the date/route
    query = Ticket.query.filter(
        Ticket.source_station == normalize_station(source),
        Ticket.destination_station == normalize_station(destination),
        Ticket.journey_date == parsed_date,
        Ticket.ticket_status == "published", # Usually 'published' or 'active'
        Ticket.verification_status == "verified",
    )
    
    # If active was the previous state, we should check both active/published to avoid breaking
    query = query.filter(Ticket.ticket_status.in_(["active", "published"]))

    if exclude_owner_id:
        query = query.filter(Ticket.owner_id != exclude_owner_id)

    requested_gender = str(gender).lower() if gender else None
    
    candidates = []
    for ticket in query.all():
        if not gender_compatible(requested_gender, ticket.passenger_gender):
            continue
        # Only class match is NOT strictly required if we want to show other classes, 
        # but previously it was strictly filtered. We will keep it strictly filtered for now,
        # or we can loosen it. Let's loosen class strictness if score is used, 
        # but user might want exact class. Wait, priority says "Same Class" which implies it's a priority, not a filter.
        
        score = calculate_match_score(ticket, class_type, requested_gender)
        candidates.append((score, ticket))
        
    # Sort by best score desc, then price asc
    candidates.sort(key=lambda x: (x[0], -float(x[1].exchange_price)), reverse=True)
    
    return [ticket for score, ticket in candidates]
