from datetime import datetime
from flask import Blueprint, request
from sqlalchemy import or_

from config.database import db
from models.conversation_model import Conversation
from models.message_model import Message
from models.ticket_model import Ticket
from models.user_model import User
from services.notification_service import create_notification
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response

chat_bp = Blueprint("chat", __name__)


@chat_bp.get("/conversations")
@auth_required
def get_conversations(user):
    convs = Conversation.query.filter(
        or_(Conversation.buyer_id == user.id, Conversation.seller_id == user.id)
    ).order_by(Conversation.last_message_at.desc()).all()

    return success_response("Conversations fetched", {
        "conversations": [c.to_dict(current_user_id=user.id) for c in convs]
    })


@chat_bp.post("/conversations/start")
@auth_required
def start_conversation(user):
    payload = request.get_json(silent=True) or {}
    ticket_id = payload.get("ticket_id")
    other_user_id = payload.get("other_user_id")

    if not other_user_id and not ticket_id:
        return error_response("ticket_id or other_user_id is required", 400)

    ticket = Ticket.query.get(ticket_id) if ticket_id else None
    seller_id = ticket.owner_id if ticket else other_user_id
    buyer_id = user.id if user.id != seller_id else other_user_id

    if not seller_id or buyer_id == seller_id:
        return error_response("Invalid user pair for conversation", 400)

    conv = Conversation.query.filter_by(
        buyer_id=buyer_id,
        seller_id=seller_id,
        ticket_id=ticket.id if ticket else None
    ).first()

    if not conv:
        conv = Conversation(
            ticket_id=ticket.id if ticket else None,
            buyer_id=buyer_id,
            seller_id=seller_id
        )
        db.session.add(conv)
        db.session.commit()

    return success_response("Conversation started", {"conversation": conv.to_dict(current_user_id=user.id)}, 201)


@chat_bp.get("/conversations/<int:conversation_id>/messages")
@auth_required
def get_conversation_messages(user, conversation_id):
    conv = Conversation.query.get(conversation_id)
    if not conv:
        return error_response("Conversation not found", 404)

    if user.id not in (conv.buyer_id, conv.seller_id):
        return error_response("Unauthorized to view this conversation", 403)

    # Mark incoming messages as read
    unread_messages = Message.query.filter_by(
        conversation_id=conv.id,
        receiver_id=user.id,
        is_read=False
    ).all()

    now = datetime.utcnow()
    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = now

    if unread_messages:
        db.session.commit()

    messages = Message.query.filter_by(conversation_id=conv.id).order_by(Message.timestamp.asc()).all()

    return success_response("Messages fetched", {
        "conversation": conv.to_dict(current_user_id=user.id),
        "messages": [m.to_dict() for m in messages]
    })


@chat_bp.post("/send")
@auth_required
def send_message(user):
    payload = request.get_json(silent=True) or {}
    msg_text = (payload.get("message") or "").strip()
    receiver_id = payload.get("receiver_id")
    conversation_id = payload.get("conversation_id")

    if not msg_text:
        return error_response("Message text is required", 400)

    conv = None
    if conversation_id:
        conv = Conversation.query.get(conversation_id)

    if not conv and receiver_id:
        receiver = User.query.get(receiver_id)
        if not receiver:
            return error_response("Receiver user not found", 404)

        seller_id = receiver.id if user.id != receiver.id else user.id
        buyer_id = user.id if user.id != receiver.id else receiver.id

        conv = Conversation.query.filter_by(buyer_id=buyer_id, seller_id=seller_id).first()
        if not conv:
            conv = Conversation(buyer_id=buyer_id, seller_id=seller_id)
            db.session.add(conv)
            db.session.commit()

    if not conv:
        return error_response("Could not determine conversation for message", 400)

    actual_receiver_id = conv.seller_id if user.id == conv.buyer_id else conv.buyer_id

    message = Message(
        conversation_id=conv.id,
        sender_id=user.id,
        receiver_id=actual_receiver_id,
        message=msg_text
    )
    conv.last_message_at = datetime.utcnow()

    db.session.add(message)
    db.session.commit()

    create_notification(
        user_id=actual_receiver_id,
        title="New Chat Message",
        message=f"{user.name} sent you a message: '{msg_text[:40]}...'",
        type="system"
    )

    return success_response("Message sent", {"message": message.to_dict()}, 201)


@chat_bp.get("/messages")
@auth_required
def get_legacy_messages(user):
    receiver_id = request.args.get("receiver_id", type=int)
    if not receiver_id:
        return error_response("receiver_id is required", 400)

    messages = (
        Message.query.filter(
            or_(
                (Message.sender_id == user.id) & (Message.receiver_id == receiver_id),
                (Message.sender_id == receiver_id) & (Message.receiver_id == user.id),
            )
        )
        .order_by(Message.timestamp.asc())
        .all()
    )
    return success_response("Messages fetched", {"messages": [message.to_dict() for message in messages]})
