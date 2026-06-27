from datetime import datetime

from config.database import db


class Rating(db.Model):
    __tablename__ = "ratings"

    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    to_user = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reviewer = db.relationship("User", foreign_keys=[from_user], lazy=True)
    reviewed_user = db.relationship("User", foreign_keys=[to_user], lazy=True)

    __table_args__ = (
        db.CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "from_user": self.from_user,
            "to_user": self.to_user,
            "rating": self.rating,
            "review": self.review,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
