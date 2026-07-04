from datetime import datetime

from config.database import db

REPORT_STATUSES = ("pending", "resolved", "dismissed")


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    reported_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=True, index=True)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reporter = db.relationship("User", foreign_keys=[reporter_id], backref=db.backref("reports_filed", lazy=True))
    reported_user = db.relationship("User", foreign_keys=[reported_user_id])
    ticket = db.relationship("Ticket")

    __table_args__ = (
        db.CheckConstraint(status.in_(REPORT_STATUSES), name="check_report_status"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "reporter_id": self.reporter_id,
            "reported_user_id": self.reported_user_id,
            "ticket_id": self.ticket_id,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
