from config.database import db
from models.notification_model import Notification


def create_notification(user_id, title, message, type="system"):
    """
    Persist notification to DB and return notification dict.
    Types: match, payment, system, request, alert
    """
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            is_read=False
        )
        db.session.add(notif)
        db.session.commit()
        return notif.to_dict()
    except Exception:
        db.session.rollback()
        return None


def send_notification(user_id, title, body, metadata=None):
    """Backwards compatible notification helper."""
    create_notification(user_id, title, body, type="system")
    return {
        "user_id": user_id,
        "title": title,
        "body": body,
        "metadata": metadata or {},
        "delivered": True,
    }
