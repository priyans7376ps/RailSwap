"""
Service module bridging backend/services/pnr_service.py to backend/app/services/pnr_service.py
Preserves existing import pathways across the application.
"""

from app.services.pnr_service import (
    fetch_realtime_pnr,
    validate_pnr_format,
    verify_pnr,
)

__all__ = ["fetch_realtime_pnr", "verify_pnr", "validate_pnr_format"]
