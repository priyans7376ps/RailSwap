from datetime import date, timedelta

from models.ticket_model import Ticket
from utils.validators import validate_pnr


def verify_pnr(pnr_number):
    """Mock PNR verification boundary.

    In production this should call an approved railway/IRCTC data provider.
    The rest of the backend treats this service as authoritative, so replacing
    this mock does not require changing route or model code.
    """
    if not validate_pnr(pnr_number):
        return {"valid": False, "reason": "PNR must be a 10 digit number"}

    existing_ticket = Ticket.query.filter_by(pnr_number=pnr_number).first()
    if existing_ticket:
        if existing_ticket.journey_date < date.today():
            return {"valid": False, "reason": "Ticket journey date is expired"}
        return {
            "valid": True,
            "message": "PNR verified from RailSwap records",
            "ticket": existing_ticket.to_dict(),
        }

    # Deterministic sandbox data lets local development verify the workflow
    # before a real PNR provider is integrated.
    return {
        "valid": True,
        "message": "PNR format accepted. External provider integration pending.",
        "ticket": {
            "pnr_number": pnr_number,
            "train_number": "12002",
            "source_station": "NDLS",
            "destination_station": "BPL",
            "journey_date": (date.today() + timedelta(days=7)).isoformat(),
            "class_type": "CC",
        },
    }
