import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")
PNR_RE = re.compile(r"^[0-9]{10}$")


def required_fields(payload, fields):
    missing = [field for field in fields if payload.get(field) in (None, "")]
    if missing:
        return f"Missing required field(s): {', '.join(missing)}"
    return None


def validate_email(email):
    return bool(email and EMAIL_RE.match(email))


def validate_phone(phone):
    return not phone or bool(PHONE_RE.match(phone))


def validate_password(password):
    return bool(password and len(password) >= 8)


def validate_pnr(pnr_number):
    return bool(pnr_number and PNR_RE.match(str(pnr_number)))


def parse_date(value):
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def parse_decimal(value):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None
    return amount if amount >= 0 else None


def normalize_station(value):
    return str(value).strip().upper() if value else value
