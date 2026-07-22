from flask import Blueprint, request

from utils.jwt_helper import jwt_role_required
from utils.response import error_response, success_response
from models.user_model import User
from config.database import db
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__)


# ---------
# Auth
# ---------
@admin_bp.post("/auth/login")
def admin_login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")

    if not email or not password:
        return error_response("Email and password are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user:
        return error_response("Invalid email or password", 401)

    if user.role != "admin":
        # Requirement: if normal user tries => Access Denied
        if not user.check_password(password):
            return error_response("Invalid email or password", 401)
        return error_response("Access Denied. Administrator privileges required.", 403)

    if not user.check_password(password):
        return error_response("Invalid email or password", 401)

    # Issue tokens using existing JWT helpers
    from utils.jwt_helper import generate_access_token, generate_refresh_token

    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)

    resp = success_response(
        "Admin login successful",
        {"user": user.to_dict(), "access_token": access_token},
    )

    from flask import current_app, make_response

    max_age_seconds = int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"].total_seconds())
    flask_resp = make_response(resp)
    flask_resp.set_cookie(
        current_app.config["JWT_REFRESH_COOKIE_NAME"],
        refresh_token,
        httponly=True,
        secure=current_app.config["JWT_REFRESH_COOKIE_SECURE"],
        samesite=current_app.config["JWT_REFRESH_COOKIE_SAMESITE"],
        domain=current_app.config.get("JWT_REFRESH_COOKIE_DOMAIN") or None,
        max_age=max_age_seconds,
        path="/",
    )

    return flask_resp


# ---------
# Protected endpoints
# ---------
@admin_bp.get("/dashboard/kpis")
@jwt_role_required(["admin"])
def dashboard_kpis():
    # Keep it minimal + production-safe. Compute what we can.
    from models.ticket_model import Ticket
    from models.transaction_model import Transaction
    from models.rating_model import Rating  # noqa: F401

    from datetime import datetime, timedelta

    total_users = User.query.count()
    total_tickets = Ticket.query.count()

    active_tickets = Ticket.query.filter(Ticket.ticket_status == "active").count()
    verified_tickets = Ticket.query.filter(Ticket.verification_status == "verified").count()
    pending_verification = Ticket.query.filter(Ticket.verification_status == "pending").count()

    total_transactions = Transaction.query.count()

    # Revenue calculation based on platform_commission
    total_revenue = db.session.query(func.sum(Transaction.platform_commission)).scalar() or 0
    
    today = datetime.utcnow().date()
    start_of_day = datetime(today.year, today.month, today.day)
    start_of_month = datetime(today.year, today.month, 1)
    
    daily_revenue = db.session.query(func.sum(Transaction.platform_commission)).filter(
        Transaction.created_at >= start_of_day
    ).scalar() or 0
    
    monthly_revenue = db.session.query(func.sum(Transaction.platform_commission)).filter(
        Transaction.created_at >= start_of_month
    ).scalar() or 0

    refund_requests = Transaction.query.filter(Transaction.payment_status == "refunded").count()
    successful_exchanges = Transaction.query.filter(Transaction.payment_status == "completed").count()

    from models.report_model import Report
    fraud_reports = Report.query.count()

    # Top Active Users (by completed_exchanges)
    top_users = User.query.order_by(User.completed_exchanges.desc()).limit(5).all()

    # Mocking top cities / routes for now, normally would group by source_station/destination_station
    # Since sqlite/postgres group_by syntax might differ or be complex in ORM, we can fetch all or do a simple group by.
    # We will just do a simple aggregation query if possible, or mock it if it's too complex.
    top_routes_query = db.session.query(
        Ticket.source_station, Ticket.destination_station, func.count(Ticket.id).label('count')
    ).group_by(Ticket.source_station, Ticket.destination_station).order_by(db.text('count DESC')).limit(5).all()
    
    top_routes = [{"source": r[0], "destination": r[1], "count": r[2]} for r in top_routes_query]

    top_cities_query = db.session.query(
        Ticket.source_station, func.count(Ticket.id).label('count')
    ).group_by(Ticket.source_station).order_by(db.text('count DESC')).limit(5).all()
    top_cities = [{"city": c[0], "count": c[1]} for c in top_cities_query]

    kpis = {
        "total_users": total_users,
        "total_tickets": total_tickets,
        "active_tickets": active_tickets,
        "verified_tickets": verified_tickets,
        "pending_verification": pending_verification,
        "successful_exchanges": successful_exchanges,
        "total_transactions": total_transactions,
        "total_revenue": float(total_revenue),
        "daily_revenue": float(daily_revenue),
        "monthly_revenue": float(monthly_revenue),
        "refund_requests": refund_requests,
        "fraud_reports": fraud_reports,
        "top_users": [{"id": u.id, "name": u.name, "exchanges": u.completed_exchanges} for u in top_users],
        "top_routes": top_routes,
        "top_cities": top_cities
    }

    return success_response("Admin KPIs fetched", {"kpis": kpis})


@admin_bp.get("/users")
@jwt_role_required(["admin"])
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return success_response("Users fetched", {"users": [u.to_dict() for u in users]})

@admin_bp.get("/reports")
@jwt_role_required(["admin"])
def list_reports():
    from models.report_model import Report
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return success_response("Reports fetched", {"data": [r.to_dict() for r in reports]})

@admin_bp.put("/reports/<int:report_id>/resolve")
@jwt_role_required(["admin"])
def resolve_report(report_id):
    from models.report_model import Report
    report = Report.query.get(report_id)
    if not report:
        return error_response("Report not found", 404)
    
    report.status = "resolved"
    db.session.commit()
    return success_response("Report resolved")

@admin_bp.get("/settings")
@jwt_role_required(["admin"])
def get_settings():
    from models.platform_setting_model import PlatformSetting
    settings = PlatformSetting.query.all()
    # Provide default baseline, but any new key added via PUT will be returned
    data = {
        "platform_commission_percent": 5.0,
        "maintenance_mode": False
    }
    for s in settings:
        data[s.key] = s.value
    return success_response("Settings fetched", data)

@admin_bp.put("/settings")
@jwt_role_required(["admin"])
def update_settings():
    from models.platform_setting_model import PlatformSetting
    payload = request.get_json(silent=True) or {}
    
    for k, v in payload.items():
        s = PlatformSetting.query.filter_by(key=k).first()
        if not s:
            s = PlatformSetting(key=k, value=v)
            db.session.add(s)
        else:
            s.value = v
            
    db.session.commit()
    
    # Return the updated config
    settings = PlatformSetting.query.all()
    data = { "platform_commission_percent": 5.0, "maintenance_mode": False }
    for s in settings:
        data[s.key] = s.value
        
    return success_response("Settings updated", data)

# --- PROFILE ACTIONS ---
@admin_bp.get("/profile")
@jwt_role_required(["admin"])
def get_profile():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response("Profile fetched", {"profile": user.to_dict()})

@admin_bp.put("/profile")
@jwt_role_required(["admin"])
def update_profile():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
        
    payload = request.get_json(silent=True) or {}
    
    if "name" in payload:
        user.name = payload["name"]
    if "email" in payload:
        # Check if email is taken by someone else
        existing = User.query.filter_by(email=payload["email"]).first()
        if existing and existing.id != user_id:
            return error_response("Email already in use", 400)
        user.email = payload["email"]
    if "phone" in payload:
        user.phone = payload["phone"]
        
    db.session.commit()
    return success_response("Profile updated", {"profile": user.to_dict()})

@admin_bp.put("/change-password")
@jwt_role_required(["admin"])
def change_password():
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
        
    payload = request.get_json(silent=True) or {}
    current_password = payload.get("current_password")
    new_password = payload.get("new_password")
    
    if not current_password or not new_password:
        return error_response("Missing required fields", 400)
        
    if not user.check_password(current_password):
        return error_response("Invalid current password", 400)
        
    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters long", 400)
        
    user.set_password(new_password)
    db.session.commit()
    
    return success_response("Password updated successfully")


# --- USERS ACTIONS ---
@admin_bp.put("/users/<int:user_id>/status")
@jwt_role_required(["admin"])
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if status in ["active", "suspended"]:
        user.status = status
        db.session.commit()
        return success_response(f"User {status} successfully")
    return error_response("Invalid status", 400)

def log_admin_action(action_type, message):
    from models.system_log_model import SystemLog
    try:
        new_log = SystemLog(type=action_type, message=message)
        db.session.add(new_log)
        db.session.commit()
    except:
        db.session.rollback()

@admin_bp.delete("/users/<int:user_id>")
@jwt_role_required(["admin"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    db.session.delete(user)
    db.session.commit()
    log_admin_action("system", f"Admin deleted user ID {user_id}")
    return success_response("User deleted successfully")


# --- TICKETS ---
@admin_bp.get("/tickets")
@jwt_role_required(["admin"])
def list_tickets():
    from models.ticket_model import Ticket
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return success_response("Tickets fetched", {"tickets": [t.to_dict() for t in tickets]})

@admin_bp.put("/tickets/<int:ticket_id>/status")
@jwt_role_required(["admin"])
def update_ticket_status(ticket_id):
    from models.ticket_model import Ticket
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)
    payload = request.get_json(silent=True) or {}
    
    if "status" in payload:
        ticket.ticket_status = payload["status"]
    if "verification_status" in payload:
        ticket.verification_status = payload["verification_status"]
        
    db.session.commit()
    return success_response("Ticket status updated")

@admin_bp.delete("/tickets/<int:ticket_id>")
@jwt_role_required(["admin"])
def delete_ticket(ticket_id):
    from models.ticket_model import Ticket
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)
    db.session.delete(ticket)
    db.session.commit()
    return success_response("Ticket deleted")


# --- VERIFICATIONS ---
@admin_bp.get("/verifications")
@jwt_role_required(["admin"])
def list_verifications():
    from models.ticket_model import Ticket
    tickets = Ticket.query.filter_by(verification_status="pending").order_by(Ticket.created_at.desc()).all()
    return success_response("Pending verifications fetched", {"verifications": [t.to_dict() for t in tickets]})


# --- TRANSACTIONS & PAYMENTS ---
@admin_bp.get("/transactions")
@jwt_role_required(["admin"])
def list_transactions():
    from models.transaction_model import Transaction
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return success_response("Transactions fetched", {"transactions": [t.to_dict() for t in transactions]})

@admin_bp.put("/transactions/<int:transaction_id>/status")
@jwt_role_required(["admin"])
def update_transaction_status(transaction_id):
    from models.transaction_model import Transaction
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return error_response("Transaction not found", 404)
    payload = request.get_json(silent=True) or {}
    
    if "payment_status" in payload:
        transaction.payment_status = payload["payment_status"]
    if "transaction_status" in payload:
        transaction.transaction_status = payload["transaction_status"]
        
    db.session.commit()
    return success_response("Transaction status updated")

@admin_bp.get("/payments")
@jwt_role_required(["admin"])
def list_payments():
    from models.transaction_model import Transaction
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return success_response("Payments fetched", {"payments": [t.to_dict() for t in transactions]})


# --- REPORTS ACTIONS ---
@admin_bp.delete("/reports/<int:report_id>")
@jwt_role_required(["admin"])
def delete_report(report_id):
    from models.report_model import Report
    report = Report.query.get(report_id)
    if not report:
        return error_response("Report not found", 404)
    db.session.delete(report)
    db.session.commit()
    return success_response("Report deleted")


# --- ANALYTICS ---
@admin_bp.get("/analytics")
@jwt_role_required(["admin"])
def get_analytics():
    from models.transaction_model import Transaction
    from models.ticket_model import Ticket
    from datetime import datetime, timedelta
    
    today = datetime.utcnow().date()
    days = 7
    revenue_trend = [0] * days
    ticket_uploads = [0] * days
    
    # Generate labels (optional, but good for reference if frontend wants it)
    labels = []
    
    for i in range(days):
        target_date = today - timedelta(days=(days - 1 - i))
        labels.append(target_date.strftime("%Y-%m-%d"))
        
        # Calculate revenue for that day
        daily_tx = Transaction.query.filter(
            func.date(Transaction.created_at) == target_date
        ).all()
        daily_rev = sum(float(tx.platform_commission or 0) for tx in daily_tx)
        revenue_trend[i] = daily_rev
        
        # Calculate ticket uploads for that day
        daily_tkts = Ticket.query.filter(
            func.date(Ticket.created_at) == target_date
        ).count()
        ticket_uploads[i] = daily_tkts
        
    return success_response("Analytics fetched", {"data": {
        "revenue_trend": revenue_trend,
        "ticket_uploads": ticket_uploads,
        "labels": labels
    }})


# --- NOTIFICATIONS ---
@admin_bp.post("/notifications/broadcast")
@jwt_role_required(["admin"])
def broadcast_notification():
    from models.notification_model import Notification
    payload = request.get_json(silent=True) or {}
    message = payload.get("message")
    if not message:
        return error_response("Message required", 400)
        
    # Get all active users
    users = User.query.filter(User.status == "active").all()
    
    # Create notification for each user
    count = 0
    for u in users:
        notification = Notification(
            user_id=u.id,
            title="System Alert",
            message=message,
            type="alert"
        )
        db.session.add(notification)
        count += 1
        
    db.session.commit()
    return success_response(f"Broadcast sent successfully to {count} users")


# --- LOGS ---
@admin_bp.get("/logs")
@jwt_role_required(["admin"])
def get_logs():
    from models.system_log_model import SystemLog
    logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).limit(100).all()
    return success_response("Logs fetched", {"logs": [log.to_dict() for log in logs]})


# --- PHASE 8 LISTING & REQUEST MANAGEMENT ---
@admin_bp.put("/tickets/<int:ticket_id>/approve")
@jwt_role_required(["admin"])
def admin_approve_ticket(ticket_id):
    from models.ticket_model import Ticket
    from models.status_history_model import StatusHistory
    from services.notification_service import create_notification

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    old_status = ticket.ticket_status
    ticket.ticket_status = "published"
    ticket.verification_status = "verified"

    sh = StatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status="published",
        notes="Admin approved listing"
    )
    db.session.add(sh)
    db.session.commit()

    create_notification(
        user_id=ticket.owner_id,
        title="Listing Approved",
        message=f"Your ticket PNR {ticket.pnr_number} has been approved by admin and is now live.",
        type="system"
    )
    return success_response("Ticket listing approved successfully", {"ticket": ticket.to_dict()})


@admin_bp.put("/tickets/<int:ticket_id>/reject")
@jwt_role_required(["admin"])
def admin_reject_ticket(ticket_id):
    from models.ticket_model import Ticket
    from models.status_history_model import StatusHistory
    from services.notification_service import create_notification

    payload = request.get_json(silent=True) or {}
    reason = payload.get("reason", "Admin rejected listing")

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    old_status = ticket.ticket_status
    ticket.ticket_status = "rejected"
    ticket.verification_status = "invalid"

    sh = StatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status="rejected",
        notes=f"Admin rejected: {reason}"
    )
    db.session.add(sh)
    db.session.commit()

    create_notification(
        user_id=ticket.owner_id,
        title="Listing Rejected",
        message=f"Your ticket PNR {ticket.pnr_number} was rejected by admin: {reason}",
        type="alert"
    )
    return success_response("Ticket listing rejected", {"ticket": ticket.to_dict()})


@admin_bp.delete("/tickets/<int:ticket_id>/force-remove")
@jwt_role_required(["admin"])
def admin_force_remove_ticket(ticket_id):
    from models.ticket_model import Ticket
    from services.notification_service import create_notification

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return error_response("Ticket not found", 404)

    owner_id = ticket.owner_id
    pnr = ticket.pnr_number

    db.session.delete(ticket)
    db.session.commit()

    create_notification(
        user_id=owner_id,
        title="Listing Removed",
        message=f"Your ticket listing PNR {pnr} was removed by admin.",
        type="alert"
    )
    return success_response("Ticket listing force removed by admin")


@admin_bp.get("/exchanges/history")
@jwt_role_required(["admin"])
def admin_exchange_history():
    from models.exchange_request_model import ExchangeRequest
    reqs = ExchangeRequest.query.order_by(ExchangeRequest.created_at.desc()).all()
    return success_response("Exchange history fetched", {"exchanges": [r.to_dict() for r in reqs]})


@admin_bp.get("/tickets/history")
@jwt_role_required(["admin"])
def admin_listing_history():
    from models.status_history_model import StatusHistory
    histories = StatusHistory.query.order_by(StatusHistory.created_at.desc()).all()
    return success_response("Listing history audit log fetched", {"history": [h.to_dict() for h in histories]})


# --- PHASE 9 ADMIN TRANSACTION CONTROLS ---
@admin_bp.get("/transactions/all")
@jwt_role_required(["admin"])
def admin_all_transactions():
    from models.transaction_model import Transaction
    status = request.args.get("status")
    query = request.args.get("query", "").strip()

    q = Transaction.query

    if status and status != "all":
        q = q.filter(Transaction.payment_status == status)

    txns = q.order_by(Transaction.created_at.desc()).all()
    results = [t.to_dict() for t in txns]

    if query:
        query_lower = query.lower()
        results = [
            t for t in results
            if query_lower in str(t["id"])
            or query_lower in str(t.get("buyer", {}).get("name", "")).lower()
            or query_lower in str(t.get("seller", {}).get("name", "")).lower()
            or query_lower in str(t.get("ticket", {}).get("pnr_number", "")).lower()
        ]

    return success_response("Admin transactions fetched", {"transactions": results})


