from flask import Blueprint, request

from models.ticket_model import Ticket
from models.transaction_model import Transaction
from services.payment_service import cancel_and_refund, complete_payment, start_payment_hold
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

payment_bp = Blueprint("payment", __name__)


@payment_bp.post("/start")
@auth_required
def start_payment(user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["ticket_id"])
    if missing:
        return error_response(missing, 400)

    ticket = Ticket.query.get(payload["ticket_id"])
    if not ticket:
        return error_response("Ticket not found", 404)

    try:
        transaction = start_payment_hold(user, ticket)
    except ValueError as exc:
        return error_response(str(exc), 400)

    return success_response("Payment received and held", {"transaction": transaction.to_dict()}, 201)


@payment_bp.post("/confirm")
@auth_required
def confirm_payment(user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["transaction_id"])
    if missing:
        return error_response(missing, 400)

    transaction = Transaction.query.get(payload["transaction_id"])
    if not transaction:
        return error_response("Transaction not found", 404)

    try:
        transaction = complete_payment(transaction, user)
    except ValueError as exc:
        return error_response(str(exc), 400)

    return success_response("Payment completed", {"transaction": transaction.to_dict()})


@payment_bp.post("/cancel")
@auth_required
def cancel_payment(user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["transaction_id"])
    if missing:
        return error_response(missing, 400)

    transaction = Transaction.query.get(payload["transaction_id"])
    if not transaction:
        return error_response("Transaction not found", 404)

    try:
        transaction = cancel_and_refund(transaction, user)
    except ValueError as exc:
        return error_response(str(exc), 400)

    return success_response("Transaction cancelled", {"transaction": transaction.to_dict()})
