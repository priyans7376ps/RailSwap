from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from config.database import db
from models.saved_ticket_model import SavedTicket
from models.ticket_model import Ticket
from utils.response import error_response, success_response

bookmark_bp = Blueprint("bookmark", __name__)


@bookmark_bp.route("", methods=["POST"])
@bookmark_bp.route("/", methods=["POST"])
@jwt_required()
def save_ticket():
    user_id = get_jwt_identity()
    data = request.get_json()
    ticket_id = data.get("ticket_id")

    if not ticket_id:
        return error_response("ticket_id is required", 400)

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    existing_save = SavedTicket.query.filter_by(user_id=user_id, ticket_id=ticket_id).first()
    if existing_save:
        return error_response("Ticket already saved", 400)

    saved_ticket = SavedTicket(user_id=user_id, ticket_id=ticket_id)
    db.session.add(saved_ticket)
    db.session.commit()

    return success_response("Ticket saved successfully", data=saved_ticket.to_dict(), status_code=201)


@bookmark_bp.route("", methods=["GET"])
@bookmark_bp.route("/", methods=["GET"])
@jwt_required()
def get_saved_tickets():
    user_id = get_jwt_identity()
    saved = SavedTicket.query.filter_by(user_id=user_id).order_by(SavedTicket.created_at.desc()).all()
    
    # Optional: fetch ticket details directly if needed, or rely on frontend to fetch them
    # Here we can return the joined data if needed, but for simplicity returning the mapping.
    # To return full ticket info, we can use ticket relationship
    results = []
    for s in saved:
        s_dict = s.to_dict()
        if s.ticket:
            s_dict["ticket"] = s.ticket.to_dict()
        results.append(s_dict)
        
    return jsonify(results)


@bookmark_bp.route("/<int:ticket_id>", methods=["DELETE"])
@jwt_required()
def remove_saved_ticket(ticket_id):
    user_id = get_jwt_identity()
    saved_ticket = SavedTicket.query.filter_by(user_id=user_id, ticket_id=ticket_id).first()
    
    if not saved_ticket:
        return error_response("Saved ticket not found", 404)
        
    db.session.delete(saved_ticket)
    db.session.commit()
    return success_response("Saved ticket removed successfully")
