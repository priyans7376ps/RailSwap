def send_email(to_email, subject, body):
    # Mock sending email - in a real startup, integrate with SendGrid, SES, Mailgun, etc.
    print(f"--- MOCK EMAIL TO: {to_email} ---")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("-----------------------------------")
    
def send_welcome_email(user):
    subject = "Welcome to RailSwap!"
    body = f"Hi {user.name},\n\nWelcome to RailSwap, the Smart Train Ticket Exchange Marketplace! We're excited to have you on board.\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)

def send_ticket_verified_email(user, ticket):
    subject = "Your Ticket has been Verified & Published"
    body = f"Hi {user.name},\n\nGood news! Your ticket for {ticket.train_number} from {ticket.source_station} to {ticket.destination_station} on {ticket.journey_date} has been verified and is now published.\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)

def send_match_found_email(user, request_details):
    subject = "Match Found for Your Ticket Request!"
    body = f"Hi {user.name},\n\nWe found a match for your request from {request_details['source']} to {request_details['destination']} on {request_details['date']}. Log in to view and secure your ticket!\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)

def send_payment_success_email(user, amount):
    subject = "Payment Successful"
    body = f"Hi {user.name},\n\nYour payment of {amount} has been successfully held in escrow. The seller has been notified to upload the original ticket.\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)

def send_refund_success_email(user, amount):
    subject = "Refund Processed"
    body = f"Hi {user.name},\n\nYour refund of {amount} has been processed successfully. It should reflect in your account shortly.\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)

def send_account_suspended_email(user):
    subject = "Account Suspended - Action Required"
    body = f"Hi {user.name},\n\nYour account has been temporarily suspended due to suspicious activity. Please contact support to resolve this issue.\n\nBest,\nThe RailSwap Team"
    send_email(user.email, subject, body)
