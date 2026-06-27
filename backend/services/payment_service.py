from config.database import db
from models.ticket_model import Ticket
from models.transaction_model import Transaction
from services.notification_service import send_notification


def start_payment_hold(buyer, ticket):
    if ticket.owner_id == buyer.id:
        raise ValueError("Buyer cannot purchase their own ticket")
    if ticket.ticket_status != "active":
        raise ValueError("Ticket is not available for purchase")
    if ticket.verification_status != "verified":
        raise ValueError("Ticket must be verified before payment")

    transaction = Transaction(
        buyer_id=buyer.id,
        seller_id=ticket.owner_id,
        ticket_id=ticket.id,
        amount=ticket.exchange_price,
        payment_status="held",
    )
    ticket.ticket_status = "matched"
    db.session.add(transaction)
    db.session.commit()

    send_notification(
        ticket.owner_id,
        "Ticket matched",
        "A buyer has paid and the amount is being held securely.",
        {"transaction_id": transaction.id},
    )
    return transaction


def complete_payment(transaction, buyer):
    if transaction.buyer_id != buyer.id:
        raise ValueError("Only the buyer can confirm ticket receipt")
    if transaction.payment_status != "held":
        raise ValueError("Only held payments can be completed")

    transaction.payment_status = "completed"
    transaction.ticket.ticket_status = "completed"
    db.session.commit()

    send_notification(
        transaction.seller_id,
        "Payment completed",
        "Buyer confirmed receipt. Payment is now released.",
        {"transaction_id": transaction.id},
    )
    return transaction


def cancel_and_refund(transaction, actor):
    if actor.id not in (transaction.buyer_id, transaction.seller_id):
        raise ValueError("Only transaction participants can cancel")
    if transaction.payment_status not in ("pending", "held"):
        raise ValueError("Transaction cannot be cancelled at this stage")

    transaction.payment_status = "refunded" if transaction.payment_status == "held" else "cancelled"
    ticket = Ticket.query.get(transaction.ticket_id)
    if ticket and ticket.ticket_status == "matched":
        ticket.ticket_status = "active"
    db.session.commit()

    send_notification(
        transaction.buyer_id,
        "Payment refunded",
        "The transaction was cancelled and buyer funds were refunded.",
        {"transaction_id": transaction.id},
    )
    return transaction
