from datetime import datetime
from config.database import db

PAYMENT_STATUSES = ("pending", "payment_held", "completed", "failed", "refunded", "cancelled")


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False, index=True)
    exchange_request_id = db.Column(db.Integer, db.ForeignKey("exchange_requests.id"), nullable=True, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    platform_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    seller_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    payment_status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    buyer = db.relationship("User", foreign_keys=[buyer_id], lazy=True)
    seller = db.relationship("User", foreign_keys=[seller_id], lazy=True)
    ticket = db.relationship("Ticket", back_populates="transactions")
    exchange_request = db.relationship("ExchangeRequest", lazy=True)
    payments = db.relationship("Payment", back_populates="transaction", cascade="all, delete-orphan", order_by="Payment.created_at.desc()")
    timeline_events = db.relationship("TransactionTimeline", back_populates="transaction", cascade="all, delete-orphan", order_by="TransactionTimeline.created_at.asc()")

    __table_args__ = (
        db.CheckConstraint(payment_status.in_(PAYMENT_STATUSES), name="check_payment_status"),
    )

    def to_dict(self):
        latest_payment = self.payments[0].to_dict() if self.payments else None
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "buyer": self.buyer.to_dict() if self.buyer else None,
            "seller_id": self.seller_id,
            "seller": self.seller.to_dict() if self.seller else None,
            "ticket_id": self.ticket_id,
            "ticket": self.ticket.to_dict() if self.ticket else None,
            "exchange_request_id": self.exchange_request_id,
            "amount": float(self.amount or 0),
            "platform_fee": float(self.platform_fee or 0),
            "seller_amount": float(self.seller_amount or 0),
            "payment_status": self.payment_status,
            "latest_payment": latest_payment,
            "timeline": [t.to_dict() for t in self.timeline_events],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
