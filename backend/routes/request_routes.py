from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request

from config.database import db
from models.exchange_request_model import ExchangeRequest
from models.ticket_model import Ticket
from models.ticket_request_model import TicketRequest
from models.transaction_model import Transaction
from services.notification_service import create_notification
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response

request_bp = Blueprint("request", __name__)


@request_bp.post("/exchange")
@auth_required
def create_exchange_request(user):
    payload = request.get_json(silent=True) or {}
    ticket_id = payload.get("ticket_id")

    if not ticket_id:
        return error_response("Missing required field: ticket_id", 400)

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    if ticket.owner_id == user.id:
        return error_response("You cannot request an exchange on your own ticket", 400)

    if ticket.ticket_status not in ("published", "active"):
        return error_response("Ticket is not available for exchange", 400)

    existing = ExchangeRequest.query.filter_by(
        ticket_id=ticket.id,
        buyer_id=user.id,
        status="pending"
    ).first()

    if existing:
        return error_response("You have already sent an exchange request for this ticket", 409)

    req = ExchangeRequest(
        ticket_id=ticket.id,
        buyer_id=user.id,
        seller_id=ticket.owner_id,
        status="pending",
        notes=payload.get("notes", "")
    )
    db.session.add(req)

    # Transition ticket status to requested
    ticket.ticket_status = "requested"
    db.session.commit()

    # Notify Seller
    create_notification(
        user_id=ticket.owner_id,
        title="Exchange Request Received",
        message=f"{user.name} sent an exchange request for your ticket PNR {ticket.pnr_number} ({ticket.source_station} to {ticket.destination_station}).",
        type="request"
    )

    return success_response("Exchange request submitted successfully", {"request": req.to_dict()}, 201)


@request_bp.get("/incoming")
@auth_required
def get_incoming_requests(user):
    reqs = ExchangeRequest.query.filter_by(seller_id=user.id).order_by(ExchangeRequest.created_at.desc()).all()
    return success_response("Incoming requests fetched", {"requests": [r.to_dict() for r in reqs]})


@request_bp.get("/outgoing")
@auth_required
def get_outgoing_requests(user):
    reqs = ExchangeRequest.query.filter_by(buyer_id=user.id).order_by(ExchangeRequest.created_at.desc()).all()
    return success_response("Outgoing requests fetched", {"requests": [r.to_dict() for r in reqs]})


@request_bp.put("/<int:request_id>/accept")
@auth_required
def accept_request(user, request_id):
    req = ExchangeRequest.query.filter_by(id=request_id, seller_id=user.id).first()
    if not req:
        return error_response("Exchange request not found", 404)

    if req.status != "pending":
        return error_response(f"Cannot accept request with status '{req.status}'", 400)

    req.status = "accepted"
    ticket = Ticket.query.get(req.ticket_id)
    if ticket:
        ticket.ticket_status = "matched"

    db.session.commit()

    # Notify Buyer
    create_notification(
        user_id=req.buyer_id,
        title="Exchange Request Accepted",
        message=f"Seller accepted your exchange request for PNR {ticket.pnr_number}. Proceed to complete exchange.",
        type="match"
    )

    return success_response("Exchange request accepted successfully", {"request": req.to_dict()})


@request_bp.put("/<int:request_id>/reject")
@auth_required
def reject_request(user, request_id):
    req = ExchangeRequest.query.filter_by(id=request_id, seller_id=user.id).first()
    if not req:
        return error_response("Exchange request not found", 404)

    req.status = "rejected"
    ticket = Ticket.query.get(req.ticket_id)
    if ticket:
        # Return ticket to published if no other pending requests
        other_pending = ExchangeRequest.query.filter(
            ExchangeRequest.ticket_id == ticket.id,
            ExchangeRequest.id != req.id,
            ExchangeRequest.status == "pending"
        ).first()
        ticket.ticket_status = "requested" if other_pending else "published"

    db.session.commit()

    # Notify Buyer
    create_notification(
        user_id=req.buyer_id,
        title="Exchange Request Rejected",
        message=f"Seller rejected your exchange request for PNR {ticket.pnr_number if ticket else ''}.",
        type="alert"
    )

    return success_response("Exchange request rejected successfully", {"request": req.to_dict()})


@request_bp.put("/<int:request_id>/cancel")
@auth_required
def cancel_request(user, request_id):
    req = ExchangeRequest.query.filter_by(id=request_id, buyer_id=user.id).first()
    if not req:
        return error_response("Exchange request not found", 404)

    if req.status != "pending":
        return error_response("Only pending requests can be cancelled", 400)

    req.status = "cancelled"
    ticket = Ticket.query.get(req.ticket_id)
    if ticket:
        other_pending = ExchangeRequest.query.filter(
            ExchangeRequest.ticket_id == ticket.id,
            ExchangeRequest.id != req.id,
            ExchangeRequest.status == "pending"
        ).first()
        ticket.ticket_status = "requested" if other_pending else "published"

    db.session.commit()
    return success_response("Exchange request cancelled successfully", {"request": req.to_dict()})


@request_bp.post("/<int:request_id>/complete-payment")
@auth_required
def complete_exchange_payment(user, request_id):
    req = ExchangeRequest.query.get(request_id)
    if not req:
        return error_response("Exchange request not found", 404)

    if user.id not in (req.buyer_id, req.seller_id):
        return error_response("Unauthorized to complete payment for this request", 403)

    req.status = "completed"
    ticket = Ticket.query.get(req.ticket_id)
    if ticket:
        ticket.ticket_status = "completed"

    # Record transaction
    txn = Transaction(
        buyer_id=req.buyer_id,
        seller_id=req.seller_id,
        ticket_id=req.ticket_id,
        amount=ticket.exchange_price if ticket else 0,
        platform_fee=ticket.exchange_price * 0.05 if ticket else 0,
        seller_amount=ticket.exchange_price * 0.95 if ticket else 0,
        status="completed"
    )
    db.session.add(txn)
    db.session.commit()

    # Send completion notifications to both buyer and seller
    create_notification(
        user_id=req.buyer_id,
        title="Exchange Completed!",
        message=f"Your ticket exchange for PNR {ticket.pnr_number if ticket else ''} is completed. Enjoy your trip!",
        type="payment"
    )
    create_notification(
        user_id=req.seller_id,
        title="Exchange Completed!",
        message=f"Ticket exchange for PNR {ticket.pnr_number if ticket else ''} has been completed successfully.",
        type="payment"
    )

    return success_response("Exchange completed successfully", {"request": req.to_dict()})


@request_bp.route("", methods=["POST"])
@request_bp.route("/", methods=["POST"])
@auth_required
def create_general_request(user):
    data = request.get_json(silent=True) or {}
    required = ["source_station", "destination_station", "journey_date"]
    for field in required:
        if field not in data:
            return error_response(f"Missing required field: {field}", 400)

    try:
        journey_date = datetime.strptime(data["journey_date"], "%Y-%m-%d").date()
    except ValueError:
        return error_response("Invalid journey_date format, expected YYYY-MM-DD", 400)

    expires_at = datetime.utcnow() + timedelta(days=7)

    new_request = TicketRequest(
        buyer_id=user.id,
        source_station=data["source_station"],
        destination_station=data["destination_station"],
        journey_date=journey_date,
        class_type=data.get("class_type"),
        passenger_gender=data.get("passenger_gender"),
        expires_at=expires_at
    )
    db.session.add(new_request)
    db.session.commit()

    return success_response("Ticket search request created successfully", {"request": new_request.to_dict()}, 201)


@request_bp.route("/me", methods=["GET"])
@auth_required
def get_my_general_requests(user):
    requests = TicketRequest.query.filter_by(buyer_id=user.id).order_by(TicketRequest.created_at.desc()).all()
    return jsonify([req.to_dict() for req in requests])


@request_bp.route("/<int:request_id>", methods=["DELETE"])
@auth_required
def delete_general_request(user, request_id):
    req = TicketRequest.query.filter_by(id=request_id, buyer_id=user.id).first()
    if not req:
        return error_response("Request not found", 404)

    db.session.delete(req)
    db.session.commit()
    return success_response("Ticket request deleted successfully")
