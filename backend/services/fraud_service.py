from datetime import datetime, timedelta

from models.ticket_model import Ticket
from models.transaction_model import Transaction

def is_suspicious_activity(user):
    """
    Check if a user is exhibiting suspicious behavior:
    - Multiple fake uploads (invalid verifications) in a short time
    - Too many cancellations
    - Repeated payment failures (can check transactions)
    """
    
    # 1. Check for too many cancelled exchanges
    if user.cancelled_exchanges > 5 and user.trust_score < 50:
        return True, "Too many cancelled exchanges with low trust score"
        
    recent_threshold = datetime.utcnow() - timedelta(days=7)
    
    # 2. Check for duplicate/fake ticket uploads
    recent_invalid_tickets = Ticket.query.filter(
        Ticket.owner_id == user.id,
        Ticket.verification_status == "invalid",
        Ticket.created_at >= recent_threshold
    ).count()
    
    if recent_invalid_tickets > 3:
        return True, "Multiple invalid ticket uploads recently"
        
    # 3. Check for repeated payment failures (cancelled transactions)
    recent_failed_payments = Transaction.query.filter(
        (Transaction.buyer_id == user.id) | (Transaction.seller_id == user.id),
        Transaction.payment_status == "cancelled",
        Transaction.created_at >= recent_threshold
    ).count()
    
    if recent_failed_payments > 5:
        return True, "Repeated transaction failures recently"
        
    return False, ""
    
def flag_suspicious_user(user, reason):
    """
    Could log this to an admin table or automatically suspend based on settings.
    For now, we'll decrease trust score significantly.
    """
    user.trust_score = max(0.0, float(user.trust_score or 100) - 20.0)
    # Could also add an internal note or flag here
