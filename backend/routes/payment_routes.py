from flask import Blueprint, jsonify, request
from config.database import db
from models.exchange_request_model import ExchangeRequest
from models.payment_model import Payment
from models.ticket_model import Ticket
from models.transaction_model import Transaction
from models.transaction_timeline_model import TransactionTimeline
from services.email_service import send_email_notification
from services.notification_service import create_notification
from services.payment_service import create_razorpay_order_demo, verify_razorpay_signature
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response

payment_bp = Blueprint("payment", __name__)


@payment_bp.post("/create-order")
@auth_required
def create_payment_order(user):
    payload = request.get_json(silent=True) or {}
    request_id = payload.get("request_id")
    ticket_id = payload.get("ticket_id")

    exchange_req = None
    if request_id:
        exchange_req = ExchangeRequest.query.get(request_id)

    ticket = None
    if exchange_req:
        ticket = Ticket.query.get(exchange_req.ticket_id)
        if exchange_req.buyer_id != user.id and exchange_req.seller_id != user.id:
            return error_response("Unauthorized for this exchange request", 403)
    elif ticket_id:
        ticket = Ticket.query.get(ticket_id)

    if not ticket:
        return error_response("Ticket listing not found", 404)

    amount = float(ticket.exchange_price or 0)
    platform_fee = round(amount * 0.05, 2)
    seller_amount = round(amount - platform_fee, 2)

    # Fetch or create transaction
    txn = None
    if exchange_req:
        txn = Transaction.query.filter_by(exchange_request_id=exchange_req.id).first()

    if not txn:
        txn = Transaction(
            buyer_id=user.id,
            seller_id=ticket.owner_id,
            ticket_id=ticket.id,
            exchange_request_id=exchange_req.id if exchange_req else None,
            amount=amount,
            platform_fee=platform_fee,
            seller_amount=seller_amount,
            payment_status="pending"
        )
        db.session.add(txn)
        db.session.commit()

        # Log timeline event
        tl = TransactionTimeline(
            transaction_id=txn.id,
            event_type="request_created",
            actor_id=user.id,
            title="Exchange Request Initiated",
            notes=f"Buyer initiated exchange order for PNR {ticket.pnr_number}"
        )
        db.session.add(tl)
        db.session.commit()

    # Generate Razorpay order
    order = create_razorpay_order_demo(amount=amount, currency="INR", receipt=f"txn_{txn.id}")

    # Log payment record
    pmt = Payment(
        transaction_id=txn.id,
        razorpay_order_id=order["order_id"],
        amount=amount,
        currency="INR",
        status="created"
    )
    db.session.add(pmt)
    db.session.commit()

    # Log timeline event
    tl_pay = TransactionTimeline(
        transaction_id=txn.id,
        event_type="payment_initiated",
        actor_id=user.id,
        title="Payment Order Created",
        notes=f"Razorpay Order {order['order_id']} created for ₹{amount}"
    )
    db.session.add(tl_pay)
    db.session.commit()

    # Send Notification
    create_notification(
        user_id=user.id,
        title="Payment Order Created",
        message=f"Razorpay order created for PNR {ticket.pnr_number}. Proceed with test mode payment.",
        type="payment"
    )

    return success_response("Payment order created", {
        "order": order,
        "transaction_id": txn.id,
        "amount": amount,
        "currency": "INR",
        "ticket": ticket.to_dict()
    }, 201)


@payment_bp.post("/verify")
@auth_required
def verify_payment(user):
    payload = request.get_json(silent=True) or {}
    transaction_id = payload.get("transaction_id")
    order_id = payload.get("razorpay_order_id")
    payment_id = payload.get("razorpay_payment_id")
    signature = payload.get("razorpay_signature")

    if not transaction_id:
        return error_response("Missing transaction_id", 400)

    txn = Transaction.query.get(transaction_id)
    if not txn:
        return error_response("Transaction not found", 404)

    ticket = Ticket.query.get(txn.ticket_id)

    # Verify signature
    is_valid = verify_razorpay_signature(order_id, payment_id, signature)
    pmt = Payment.query.filter_by(transaction_id=txn.id, razorpay_order_id=order_id).first()
    if not pmt:
        pmt = Payment(
            transaction_id=txn.id,
            razorpay_order_id=order_id,
            amount=txn.amount,
            currency="INR"
        )
        db.session.add(pmt)

    pmt.razorpay_payment_id = payment_id
    pmt.razorpay_signature = signature

    if is_valid:
        pmt.status = "captured"
        txn.payment_status = "payment_held"

        if ticket:
            ticket.ticket_status = "matched"

        if txn.exchange_request:
            txn.exchange_request.status = "accepted"

        # Log timeline
        tl = TransactionTimeline(
            transaction_id=txn.id,
            event_type="payment_held",
            actor_id=user.id,
            title="Payment Received & Held in Escrow",
            notes=f"Payment ID {payment_id} captured. ₹{txn.amount} held in platform escrow."
        )
        db.session.add(tl)
        db.session.commit()

        # Send Notifications & Emails
        create_notification(
            user_id=txn.buyer_id,
            title="Payment Held in Escrow",
            message=f"Your payment of ₹{txn.amount} for PNR {ticket.pnr_number if ticket else ''} is held in escrow.",
            type="payment"
        )
        create_notification(
            user_id=txn.seller_id,
            title="Buyer Completed Payment",
            message=f"Buyer paid ₹{txn.amount} for PNR {ticket.pnr_number if ticket else ''}. Funds are held in escrow.",
            type="match"
        )

        send_email_notification(
            to_email=user.email,
            subject=f"Payment Success - PNR {ticket.pnr_number if ticket else ''}",
            template_type="payment_success",
            context={
                "buyer_name": user.name,
                "amount": txn.amount,
                "pnr": ticket.pnr_number if ticket else "",
                "source": ticket.source_station if ticket else "",
                "destination": ticket.destination_station if ticket else "",
                "journey_date": ticket.journey_date if ticket else ""
            }
        )

        return success_response("Payment verified and held in escrow", {"transaction": txn.to_dict()})
    else:
        pmt.status = "failed"
        pmt.error_reason = "Signature verification failed"
        txn.payment_status = "failed"

        tl = TransactionTimeline(
            transaction_id=txn.id,
            event_type="payment_failed",
            actor_id=user.id,
            title="Payment Verification Failed",
            notes="Invalid signature or cancelled transaction"
        )
        db.session.add(tl)
        db.session.commit()

        send_email_notification(
            to_email=user.email,
            subject="Payment Failed - RailSwap",
            template_type="payment_failure",
            context={
                "buyer_name": user.name,
                "pnr": ticket.pnr_number if ticket else "",
                "reason": "Payment signature verification failed."
            }
        )

        return error_response("Payment verification failed", 400)


@payment_bp.post("/retry")
@auth_required
def retry_payment(user):
    payload = request.get_json(silent=True) or {}
    transaction_id = payload.get("transaction_id")

    txn = Transaction.query.get(transaction_id)
    if not txn:
        return error_response("Transaction not found", 404)

    if txn.buyer_id != user.id:
        return error_response("Unauthorized", 403)

    txn.payment_status = "pending"
    order = create_razorpay_order_demo(amount=float(txn.amount), currency="INR", receipt=f"retry_{txn.id}")

    pmt = Payment(
        transaction_id=txn.id,
        razorpay_order_id=order["order_id"],
        amount=txn.amount,
        currency="INR",
        status="created"
    )
    db.session.add(pmt)
    db.session.commit()

    return success_response("Payment order recreated for retry", {
        "order": order,
        "transaction_id": txn.id,
        "amount": float(txn.amount)
    })
