from datetime import datetime
from config.database import db


class TransactionTimeline(db.Model):
    __tablename__ = "transaction_timelines"

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey("transactions.id"), nullable=False, index=True)
    event_type = db.Column(db.String(50), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    title = db.Column(db.String(120), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    actor = db.relationship("User", foreign_keys=[actor_id], lazy=True)
    transaction = db.relationship("Transaction", back_populates="timeline_events")

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_id": self.transaction_id,
            "event_type": self.event_type,
            "actor_id": self.actor_id,
            "actor_name": self.actor.name if self.actor else "System",
            "title": self.title,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
