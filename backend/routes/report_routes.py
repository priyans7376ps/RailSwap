from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from config.database import db
from models.report_model import Report
from utils.response import error_response, success_response

report_bp = Blueprint("report", __name__)


@report_bp.route("/", methods=["POST"])
@jwt_required()
def create_report():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("reason"):
        return error_response("Reason is required", 400)

    new_report = Report(
        reporter_id=user_id,
        reported_user_id=data.get("reported_user_id"),
        ticket_id=data.get("ticket_id"),
        reason=data.get("reason")
    )
    
    db.session.add(new_report)
    db.session.commit()
    
    return success_response("Report submitted successfully", data=new_report.to_dict(), status_code=201)
