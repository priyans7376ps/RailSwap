from datetime import datetime

from config.database import db

class SavedTicket(db.Model):
    __tablename__ = "saved_tickets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("saved_tickets", lazy=True))
    ticket = db.relationship("Ticket")

    __table_args__ = (
        db.UniqueConstraint("user_id", "ticket_id", name="unique_saved_ticket"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ticket_id": self.ticket_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
