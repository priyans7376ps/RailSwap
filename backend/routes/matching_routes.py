from flask import Blueprint, request

from services.matching_service import find_matching_tickets
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

matching_bp = Blueprint("matching", __name__)


@matching_bp.get("/tickets")
@auth_required
def match_tickets(user):
    params = request.args.to_dict()
    missing = required_fields(params, ["source", "destination", "date", "class"])
    if missing:
        return error_response(missing, 400)

    tickets = find_matching_tickets(
        params["source"],
        params["destination"],
        params["date"],
        params["class"],
        params.get("gender"),
        exclude_owner_id=user.id,
    )
    return success_response("Matching tickets fetched", {"tickets": [ticket.to_dict() for ticket in tickets]})
