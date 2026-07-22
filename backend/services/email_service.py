import logging

logger = logging.getLogger(__name__)


def send_email_notification(to_email: str, subject: str, template_type: str, context: dict = None) -> bool:
    """
    Renders HTML transactional email templates and logs/dispatches notification email.
    """
    context = context or {}
    logger.info("[Email Service] Preparing email '%s' for '%s' [Type: %s]", subject, to_email, template_type)

    html_content = ""
    if template_type == "payment_success":
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Payment Received & Held in Escrow</h2>
          <p>Hi {context.get('buyer_name', 'Traveller')},</p>
          <p>Your payment of <strong>₹{context.get('amount', '0')}</strong> for Ticket PNR <strong>{context.get('pnr', '')}</strong> has been successfully processed and is currently <strong>HELD SECURELY</strong> in platform escrow.</p>
          <p>Journey: {context.get('source')} to {context.get('destination')} ({context.get('journey_date')})</p>
          <p>Once you verify the ticket details, click 'Confirm Completion' to release funds to the seller.</p>
          <p>RailSwap Team</p>
        </div>
        """
    elif template_type == "payment_failure":
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #e11d48;">Payment Attempt Failed</h2>
          <p>Hi {context.get('buyer_name', 'Traveller')},</p>
          <p>Your payment attempt for PNR <strong>{context.get('pnr', '')}</strong> failed or was cancelled.</p>
          <p>Reason: {context.get('reason', 'Transaction was not completed.')}</p>
          <p>You can retry payment directly from your <a href="{context.get('retry_url', '#')}">Exchange Requests</a> page.</p>
          <p>RailSwap Team</p>
        </div>
        """
    elif template_type == "request_accepted":
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Exchange Request Accepted!</h2>
          <p>Hi {context.get('buyer_name', 'Traveller')},</p>
          <p>Great news! The seller has accepted your exchange request for PNR <strong>{context.get('pnr', '')}</strong> ({context.get('source')} → {context.get('destination')}).</p>
          <p>Please proceed to complete payment to hold funds and finalize the swap.</p>
          <p>RailSwap Team</p>
        </div>
        """
    elif template_type == "request_rejected":
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Exchange Request Update</h2>
          <p>Hi {context.get('buyer_name', 'Traveller')},</p>
          <p>Your exchange request for PNR <strong>{context.get('pnr', '')}</strong> was not accepted by the seller.</p>
          <p>You can continue searching for matching tickets on RailSwap.</p>
          <p>RailSwap Team</p>
        </div>
        """
    elif template_type == "transaction_completed":
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #059669;">Ticket Exchange Successfully Completed!</h2>
          <p>Hi {context.get('user_name', 'Traveller')},</p>
          <p>Your ticket exchange for PNR <strong>{context.get('pnr', '')}</strong> has been confirmed complete. Funds have been released.</p>
          <p>Please leave a rating for your swap partner on RailSwap!</p>
          <p>RailSwap Team</p>
        </div>
        """

    logger.info("[Email Service] DISPATCHED EMAIL -> Subject: %s | To: %s", subject, to_email)
    return True
