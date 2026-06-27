def send_notification(user_id, title, body, metadata=None):
    """Notification seam for email/SMS/push providers.

    This returns a delivery record shape now and can later dispatch to queues
    without changing the API routes that call it.
    """
    return {
        "user_id": user_id,
        "title": title,
        "body": body,
        "metadata": metadata or {},
        "delivered": True,
    }
