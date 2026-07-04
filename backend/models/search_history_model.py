from datetime import datetime

from config.database import db

class SearchHistory(db.Model):
    __tablename__ = "search_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True) # allow anonymous searches maybe? or keep it tied to user
    search_query = db.Column(db.JSON, nullable=False) # e.g. {"source": "NYC", "dest": "BOS"}
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("search_history", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "search_query": self.search_query,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
