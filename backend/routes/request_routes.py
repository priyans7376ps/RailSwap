from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from config.database import db
from models.ticket_request_model import TicketRequest
from utils.response import error_response, success_response

request_bp = Blueprint("request", __name__)


@request_bp.route("", methods=["POST"])
@request_bp.route("/", methods=["POST"])
@jwt_required()
def create_request():
    user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ["source_station", "destination_station", "journey_date"]
    for field in required_fields:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)

    try:
        journey_date = datetime.strptime(data["journey_date"], "%Y-%m-%d").date()
    except ValueError:
        return error_response("Invalid journey_date format, expected YYYY-MM-DD", 400)

    expires_at = datetime.utcnow() + timedelta(days=7) # Default expiry
    
    new_request = TicketRequest(
        buyer_id=user_id,
        source_station=data["source_station"],
        destination_station=data["destination_station"],
        journey_date=journey_date,
        class_type=data.get("class_type"),
        passenger_gender=data.get("passenger_gender"),
        expires_at=expires_at
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    # TODO: Trigger smart matching engine here to notify if match exists
    
    return success_response("Ticket request created successfully", data=new_request.to_dict(), status_code=201)


@request_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_requests():
    user_id = get_jwt_identity()
    requests = TicketRequest.query.filter_by(buyer_id=user_id).order_by(TicketRequest.created_at.desc()).all()
    return jsonify([req.to_dict() for req in requests])


@request_bp.route("/<int:request_id>", methods=["DELETE"])
@jwt_required()
def delete_request(request_id):
    user_id = get_jwt_identity()
    req = TicketRequest.query.filter_by(id=request_id, buyer_id=user_id).first()
    
    if not req:
        return error_response("Request not found", 404)
        
    db.session.delete(req)
    db.session.commit()
    return success_response("Ticket request deleted successfully")
