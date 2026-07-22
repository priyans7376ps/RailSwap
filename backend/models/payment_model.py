from datetime import datetime
from config.database import db

PAYMENT_LOG_STATUSES = ("created", "captured", "failed", "refunded")


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey("transactions.id"), nullable=False, index=True)
    razorpay_order_id = db.Column(db.String(100), nullable=True, index=True)
    razorpay_payment_id = db.Column(db.String(100), nullable=True, index=True)
    razorpay_signature = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="INR")
    status = db.Column(db.String(20), nullable=False, default="created")
    error_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    transaction = db.relationship("Transaction", back_populates="payments")

    __table_args__ = (
        db.CheckConstraint(status.in_(PAYMENT_LOG_STATUSES), name="check_payment_log_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_id": self.transaction_id,
            "razorpay_order_id": self.razorpay_order_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "amount": float(self.amount or 0),
            "currency": self.currency,
            "status": self.status,
            "error_reason": self.error_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
