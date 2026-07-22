from datetime import datetime
from config.database import db


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=True, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    last_message_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    buyer = db.relationship("User", foreign_keys=[buyer_id], lazy=True)
    seller = db.relationship("User", foreign_keys=[seller_id], lazy=True)
    ticket = db.relationship("Ticket", lazy=True)
    messages = db.relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.timestamp.asc()")

    def to_dict(self, current_user_id=None):
        last_msg = self.messages[-1].to_dict() if self.messages else None
        unread_count = 0
        if current_user_id:
            unread_count = sum(1 for m in self.messages if m.receiver_id == current_user_id and not m.is_read)

        other_user = self.seller if current_user_id == self.buyer_id else self.buyer
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "ticket": self.ticket.to_dict() if self.ticket else None,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "other_user": other_user.to_dict() if other_user else None,
            "last_message": last_msg,
            "unread_count": unread_count,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
