from datetime import datetime

from config.database import db


class StatusHistory(db.Model):
    __tablename__ = "status_histories"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False, index=True)
    old_status = db.Column(db.String(30), nullable=True)
    new_status = db.Column(db.String(30), nullable=False)
    changed_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    ticket = db.relationship("Ticket", backref=db.backref("status_history", lazy=True, cascade="all, delete-orphan"))
    changed_by = db.relationship("User", foreign_keys=[changed_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "changed_by_id": self.changed_by_id,
            "changed_by": self.changed_by.name if self.changed_by else "System",
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
