from flask import Blueprint, jsonify, request
from config.database import db
from models.conversation_model import Conversation
from models.exchange_request_model import ExchangeRequest
from models.rating_model import Rating
from models.ticket_model import Ticket
from models.transaction_model import Transaction
from models.transaction_timeline_model import TransactionTimeline
from services.email_service import send_email_notification
from services.notification_service import create_notification
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response

transaction_bp = Blueprint("transaction", __name__)


@transaction_bp.get("/<int:transaction_id>")
@auth_required
def get_transaction_details(user, transaction_id):
    txn = Transaction.query.get(transaction_id)
    if not txn:
        return error_response("Transaction not found", 404)

    if user.id not in (txn.buyer_id, txn.seller_id) and user.role != "admin":
        return error_response("Unauthorized to view this transaction", 403)

    data = txn.to_dict()

    # Check if existing rating submitted
    user_rating = Rating.query.filter_by(transaction_id=txn.id, from_user=user.id).first()
    data["user_rating"] = user_rating.to_dict() if user_rating else None

    # Check or create conversation link
    conv = Conversation.query.filter_by(
        buyer_id=txn.buyer_id,
        seller_id=txn.seller_id,
        ticket_id=txn.ticket_id
    ).first()
    data["conversation_id"] = conv.id if conv else None

    return success_response("Transaction details fetched", {"transaction": data})


@transaction_bp.post("/<int:transaction_id>/confirm-completion")
@auth_required
def confirm_transaction_completion(user, transaction_id):
    txn = Transaction.query.get(transaction_id)
    if not txn:
        return error_response("Transaction not found", 404)

    if user.id not in (txn.buyer_id, txn.seller_id):
        return error_response("Unauthorized to confirm completion for this transaction", 403)

    if txn.payment_status == "completed":
        return error_response("Transaction is already marked as completed", 400)

    txn.payment_status = "completed"
    ticket = Ticket.query.get(txn.ticket_id)
    if ticket:
        ticket.ticket_status = "completed"

    if txn.exchange_request:
        txn.exchange_request.status = "completed"

    # Log timeline event
    tl = TransactionTimeline(
        transaction_id=txn.id,
        event_type="completed",
        actor_id=user.id,
        title="Exchange Confirmed & Completed",
        notes=f"Transaction completion confirmed by {user.name}. Held funds of ₹{txn.amount} released to seller."
    )
    db.session.add(tl)
    db.session.commit()

    # Update seller completed exchange counter
    seller = txn.seller
    if seller:
        seller.completed_exchanges = (seller.completed_exchanges or 0) + 1

    buyer = txn.buyer
    if buyer:
        buyer.completed_exchanges = (buyer.completed_exchanges or 0) + 1

    db.session.commit()

    # Send Notifications & Emails
    create_notification(
        user_id=txn.buyer_id,
        title="Ticket Exchange Completed!",
        message=f"Ticket exchange for PNR {ticket.pnr_number if ticket else ''} is complete. Please rate your experience!",
        type="payment"
    )
    create_notification(
        user_id=txn.seller_id,
        title="Ticket Exchange Completed!",
        message=f"Exchange complete! ₹{txn.seller_amount} released for PNR {ticket.pnr_number if ticket else ''}.",
        type="payment"
    )

    send_email_notification(
        to_email=user.email,
        subject="Ticket Exchange Completed - RailSwap",
        template_type="transaction_completed",
        context={
            "user_name": user.name,
            "pnr": ticket.pnr_number if ticket else ""
        }
    )

    return success_response("Transaction completed successfully", {"transaction": txn.to_dict()})


@transaction_bp.get("/mine")
@auth_required
def get_my_transactions(user):
    txns = Transaction.query.filter(
        (Transaction.buyer_id == user.id) | (Transaction.seller_id == user.id)
    ).order_by(Transaction.created_at.desc()).all()

    return success_response("Transactions fetched", {"transactions": [t.to_dict() for t in txns]})
