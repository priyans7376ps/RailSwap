from datetime import datetime

from config.database import db


PAYMENT_STATUSES = ("pending", "held", "completed", "refunded", "cancelled")


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    platform_commission = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    payment_status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    buyer = db.relationship("User", foreign_keys=[buyer_id], lazy=True)
    seller = db.relationship("User", foreign_keys=[seller_id], lazy=True)
    ticket = db.relationship("Ticket", back_populates="transactions")

    __table_args__ = (
        db.CheckConstraint(payment_status.in_(PAYMENT_STATUSES), name="check_payment_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "ticket_id": self.ticket_id,
            "amount": float(self.amount or 0),
            "platform_commission": float(self.platform_commission or 0),
            "payment_status": self.payment_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
