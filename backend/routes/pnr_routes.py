from flask import Blueprint, request, jsonify
from app.services.pnr_service import verify_pnr

pnr_bp = Blueprint("pnr", __name__)


@pnr_bp.post("/verify")
def verify_pnr_route():
    """
    POST /api/pnr/verify
    Body: { "pnr": "2749628734" }
    """
    payload = request.get_json(silent=True) or {}
    pnr_input = payload.get("pnr") or payload.get("pnr_number")

    if not pnr_input:
        return jsonify({
            "success": False,
            "verified": False,
            "message": "Invalid PNR number."
        }), 400

    result = verify_pnr(str(pnr_input))

    if result.get("success") and result.get("verified"):
        # Add backward-compatible data field containing ticket object
        result["data"] = {
            "verified": True,
            "pnr": result.get("pnr"),
            "train_number": result.get("train_number"),
            "train_name": result.get("train_name"),
            "source": result.get("source"),
            "destination": result.get("destination"),
            "journey_date": result.get("journey_date"),
            "ticket": {
                "pnr_number": result.get("pnr"),
                "train_number": result.get("train_number"),
                "train_name": result.get("train_name"),
                "source_station": result.get("source"),
                "destination_station": result.get("destination"),
                "journey_date": result.get("journey_date"),
                "status": "CONFIRMED"
            }
        }
        return jsonify(result), 200

    status_code = 400 if result.get("message") == "Invalid PNR number." else 400
    return jsonify(result), status_code
