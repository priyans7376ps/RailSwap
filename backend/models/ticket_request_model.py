from datetime import datetime

from config.database import db

REQUEST_STATUSES = ("active", "matched", "expired", "cancelled")


class TicketRequest(db.Model):
    __tablename__ = "ticket_requests"

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    source_station = db.Column(db.String(20), nullable=False, index=True)
    destination_station = db.Column(db.String(20), nullable=False, index=True)
    journey_date = db.Column(db.Date, nullable=False, index=True)
    class_type = db.Column(db.String(10), nullable=True)
    passenger_gender = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    buyer = db.relationship("User", backref=db.backref("requests", lazy=True))

    __table_args__ = (
        db.CheckConstraint(status.in_(REQUEST_STATUSES), name="check_request_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "source_station": self.source_station,
            "destination_station": self.destination_station,
            "journey_date": self.journey_date.isoformat() if self.journey_date else None,
            "class_type": self.class_type,
            "passenger_gender": self.passenger_gender,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }
