from flask import Blueprint, request
from sqlalchemy import or_

from config.database import db
from models.message_model import Message
from models.user_model import User
from utils.jwt_helper import auth_required
from utils.response import error_response, success_response
from utils.validators import required_fields

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/send")
@auth_required
def send_message(user):
    payload = request.get_json(silent=True) or {}
    missing = required_fields(payload, ["receiver_id", "message"])
    if missing:
        return error_response(missing, 400)

    receiver = User.query.get(payload["receiver_id"])
    if not receiver:
        return error_response("Receiver not found", 404)
    if receiver.id == user.id:
        return error_response("Cannot send a message to yourself", 400)

    message = Message(sender_id=user.id, receiver_id=receiver.id, message=payload["message"].strip())
    db.session.add(message)
    db.session.commit()

    return success_response("Message sent", {"message": message.to_dict()}, 201)


@chat_bp.get("/messages")
@auth_required
def get_messages(user):
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
