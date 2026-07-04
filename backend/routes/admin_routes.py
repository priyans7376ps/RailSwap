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
        return error_response("Access Denied", 403)

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
    setting = PlatformSetting.query.first()
    if not setting:
        setting = PlatformSetting()
        db.session.add(setting)
        db.session.commit()
    return success_response("Settings fetched", setting.to_dict())

@admin_bp.put("/settings")
@jwt_role_required(["admin"])
def update_settings():
    from models.platform_setting_model import PlatformSetting
    payload = request.get_json(silent=True) or {}
    
    setting = PlatformSetting.query.first()
    if not setting:
        setting = PlatformSetting()
        db.session.add(setting)
        
    if "platform_commission_percent" in payload:
        setting.platform_commission_percent = payload["platform_commission_percent"]
    if "maintenance_mode" in payload:
        setting.maintenance_mode = payload["maintenance_mode"]
        
    db.session.commit()
    return success_response("Settings updated", setting.to_dict())
