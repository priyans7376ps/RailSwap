from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from config.database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    # Role-based access control for admin portal. Values: "user" | "admin"
    role = db.Column(db.String(32), nullable=False, default="user", index=True)
    rating = db.Column(db.Numeric(3, 2), nullable=False, default=0)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    completed_exchanges = db.Column(db.Integer, nullable=False, default=0)
    cancelled_exchanges = db.Column(db.Integer, nullable=False, default=0)
    trust_score = db.Column(db.Numeric(5, 2), nullable=False, default=100.0)
    verification_badge = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


    tickets = db.relationship("Ticket", back_populates="owner", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "profile_image": self.profile_image,
            "rating": float(self.rating or 0),
            "role": self.role,
            "is_verified": self.is_verified,
            "completed_exchanges": self.completed_exchanges,
            "cancelled_exchanges": self.cancelled_exchanges,
            "trust_score": float(self.trust_score or 100.0),
            "verification_badge": self.verification_badge,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
