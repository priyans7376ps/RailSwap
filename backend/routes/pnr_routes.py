import logging
import traceback
from flask import Blueprint, request, jsonify
from app.services.pnr_service import verify_pnr

logger = logging.getLogger(__name__)
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
            "message": "Invalid PNR Number."
        }), 400

    try:
        result = verify_pnr(str(pnr_input))
        logger.info("[PNR ROUTE] Result for %s: %s", pnr_input, result)
        print("PNR RESULT =>", result)
    except Exception as exc:
        logger.error("[PNR ROUTE] Exception during verification: %s", str(exc))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "verified": False,
            "message": f"Server error during verification: {str(exc)}"
        }), 500

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

    # Clean HTTP 400 response for unsuccessful/unverified PNR checks
    status_code = 200 if result.get("verified") else 400
    return jsonify(result), status_code