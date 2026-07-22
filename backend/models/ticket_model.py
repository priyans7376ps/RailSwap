from datetime import datetime

from config.database import db

TICKET_STATUSES = (
    "draft",
    "pending_verification",
    "verified",
    "published",
    "active",
    "requested",
    "matched",
    "payment_pending",
    "payment_held",
    "completed",
    "expired",
    "rejected",
    "cancelled",
)
VERIFICATION_STATUSES = ("pending", "verified", "invalid", "rejected")
CLASS_TYPES = ("SL", "3A", "2A", "1A", "CC", "EC", "2S")
GENDERS = ("male", "female", "other", "any")


class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    pnr_number = db.Column(db.String(10), unique=True, nullable=False, index=True)
    train_number = db.Column(db.String(20), nullable=False)
    source_station = db.Column(db.String(20), nullable=False, index=True)
    destination_station = db.Column(db.String(20), nullable=False, index=True)
    journey_date = db.Column(db.Date, nullable=False, index=True)
    class_type = db.Column(db.String(10), nullable=False, index=True)
    passenger_gender = db.Column(db.String(20), nullable=False)
    original_price = db.Column(db.Numeric(10, 2), nullable=False)
    exchange_price = db.Column(db.Numeric(10, 2), nullable=False)
    ticket_pdf = db.Column(db.String(255), nullable=True)
    verification_status = db.Column(db.String(20), nullable=False, default="pending")
    ticket_status = db.Column(db.String(30), nullable=False, default="draft")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    owner = db.relationship("User", back_populates="tickets")
    transactions = db.relationship("Transaction", back_populates="ticket", lazy=True)

    __table_args__ = (
        db.CheckConstraint(ticket_status.in_(TICKET_STATUSES), name="check_ticket_status"),
        db.CheckConstraint(
            verification_status.in_(VERIFICATION_STATUSES),
            name="check_verification_status",
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "owner_id": self.owner_id,
            "pnr_number": self.pnr_number,
            "train_number": self.train_number,
            "source_station": self.source_station,
            "destination_station": self.destination_station,
            "journey_date": self.journey_date.isoformat() if self.journey_date else None,
            "class_type": self.class_type,
            "passenger_gender": self.passenger_gender,
            "original_price": float(self.original_price or 0),
            "exchange_price": float(self.exchange_price or 0),
            "ticket_pdf": self.ticket_pdf,
            "verification_status": self.verification_status,
            "ticket_status": self.ticket_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "owner": self.owner.to_dict() if self.owner else None,
        }
