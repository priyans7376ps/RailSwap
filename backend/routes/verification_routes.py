from flask import Blueprint, request

from services.pnr_service import verify_pnr
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

verification_bp = Blueprint("verification", __name__)


@verification_bp.post("/verify")
@auth_required
def verify_ticket(_user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["pnr_number"])
    if missing:
        return error_response(missing, 400)

    result = verify_pnr(str(payload["pnr_number"]))
    if not result["valid"]:
        return error_response(result["reason"], 422)
    return success_response("Ticket verified", result)
