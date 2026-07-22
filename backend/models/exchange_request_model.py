from datetime import datetime

from config.database import db

EXCHANGE_REQUEST_STATUSES = ("pending", "accepted", "rejected", "cancelled", "completed")


class ExchangeRequest(db.Model):
    __tablename__ = "exchange_requests"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    ticket = db.relationship("Ticket", backref=db.backref("exchange_requests", lazy=True, cascade="all, delete-orphan"))
    buyer = db.relationship("User", foreign_keys=[buyer_id], backref=db.backref("outgoing_exchange_requests", lazy=True))
    seller = db.relationship("User", foreign_keys=[seller_id], backref=db.backref("incoming_exchange_requests", lazy=True))

    __table_args__ = (
        db.CheckConstraint(status.in_(EXCHANGE_REQUEST_STATUSES), name="check_exchange_request_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "ticket": self.ticket.to_dict() if self.ticket else None,
            "buyer": self.buyer.to_dict() if self.buyer else None,
            "seller": self.seller.to_dict() if self.seller else None,
        }
