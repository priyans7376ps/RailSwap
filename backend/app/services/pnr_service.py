import os
import re
import json
import socket
import logging
import urllib.request
import urllib.parse
import urllib.error

logger = logging.getLogger(__name__)


def validate_pnr_format(pnr_str: str) -> bool:
    """
    Validate that PNR is strictly a 10-digit numeric string.
    Rejects: letters, spaces, special characters, <10 digits, >10 digits.
    """
    if not pnr_str or not isinstance(pnr_str, str):
        return False
    return bool(re.match(r"^\d{10}$", pnr_str.strip()))


def _extract_field(obj: dict, keys: list) -> str:
    """Extract string value from a dictionary trying multiple key aliases without default fallbacks."""
    if not isinstance(obj, dict):
        return ""
    for key in keys:
        if key in obj and obj[key] is not None:
            val = str(obj[key]).strip()
            if val:
                return val
    return ""


def fetch_realtime_pnr(pnr_str: str) -> dict:
    """
    Call RapidAPI PNR Status API to fetch live details for a 10-digit PNR.
    NO mock data, NO hardcoded train details, NO fake fallbacks.
    """
    pnr_clean = str(pnr_str).strip() if pnr_str else ""

    # 1. Strict 10-digit validation check
    if not validate_pnr_format(pnr_clean):
        logger.warning("[PNR Verification] Validation failed for input PNR: '%s'", pnr_str)
        return {
            "success": False,
            "verified": False,
            "message": "Invalid PNR Number."
        }

    # 2. Read credentials from backend/.env
    api_key = os.getenv("RAPIDAPI_KEY", "").strip()
    primary_host = os.getenv("RAPIDAPI_HOST", "real-time-pnr-status-api-for-indian-railways.p.rapidapi.com").strip()

    if not api_key or api_key == "YOUR_NEW_RAPIDAPI_KEY":
        logger.error("[PNR Verification] RapidAPI key missing or unconfigured in backend/.env")
        return {
            "success": False,
            "verified": False,
            "message": "RapidAPI credentials not configured in backend/.env."
        }

    # Define endpoints to attempt (Primary API spec + secondary fallback host)
    candidate_requests = [
        # Candidate 1: Real-Time PNR Status API
        {
            "host": primary_host,
            "url": f"https://{primary_host}/name/{pnr_clean}"
        },
        {
            "host": primary_host,
            "url": f"https://{primary_host}/getPNRStatus/{pnr_clean}"
        },
        # Candidate 2: Secondary IRCTC Gateway Host
        {
            "host": "indian-railway-irctc.p.rapidapi.com",
            "url": f"https://indian-railway-irctc.p.rapidapi.com/api/v1/getPNRStatus?pnr={pnr_clean}"
        }
    ]

    last_error_message = "Invalid PNR Number."

    for item in candidate_requests:
        host = item["host"]
        api_url = item["url"]

        headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": host,
            "x-api-key": api_key,
            "x-api-host": host,
            "Content-Type": "application/json",
            "x-rapid-api": "rapid-api-database",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RailSwap/1.0"
        }

        logger.info("[PNR Verification] Requesting RapidAPI host '%s' -> %s", host, api_url)

        try:
            req = urllib.request.Request(api_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=8) as response:
                status_code = response.status
                raw_data = response.read().decode("utf-8")
                
                logger.info("[PNR Verification] HTTP %s from RapidAPI for PNR: %s", status_code, pnr_clean)

                try:
                    payload = json.loads(raw_data)
                except json.JSONDecodeError as exc:
                    logger.error("[PNR Verification] JSON parse error: %s", str(exc))
                    continue

                if isinstance(payload, dict):
                    if payload.get("status") is False or payload.get("success") is False or payload.get("flag") is False:
                        err_msg = payload.get("message") or payload.get("error")
                        if err_msg:
                            last_error_message = str(err_msg)
                        continue

                ticket_data = (
                    payload.get("data")
                    or payload.get("result")
                    or payload.get("response")
                    or payload
                )

                train_number = _extract_field(ticket_data, ["train_number", "trainNo", "trainNumber", "TrainNo", "train_num"])
                train_name = _extract_field(ticket_data, ["train_name", "trainName", "TrainName", "name"])
                source = _extract_field(ticket_data, ["source", "source_station", "from", "From", "src", "BoardingStationName", "sourceStation"])
                destination = _extract_field(ticket_data, ["destination", "destination_station", "to", "To", "dest", "ReservationUptoName", "destinationStation"])
                journey_date = _extract_field(ticket_data, ["journey_date", "date", "journeyDate", "dateOfJourney", "Doj", "doj"])

                # Reject if core fields are missing from JSON
                if not train_number and not source and not destination:
                    logger.warning("[PNR Verification] RapidAPI payload missing train fields for PNR %s", pnr_clean)
                    continue

                logger.info("[PNR Verification] SUCCESS - Live PNR %s verified via RapidAPI", pnr_clean)
                return {
                    "success": True,
                    "verified": True,
                    "pnr": pnr_clean,
                    "train_number": train_number or "N/A",
                    "train_name": train_name or "N/A",
                    "source": source or "N/A",
                    "destination": destination or "N/A",
                    "journey_date": journey_date or "N/A",
                    "message": "PNR verified successfully."
                }

        except urllib.error.HTTPError as exc:
            logger.error("[PNR Verification] RapidAPI HTTP Error %s for URL %s", exc.code, api_url)
            if exc.code == 429:
                last_error_message = "RapidAPI rate limit or monthly quota exceeded (HTTP 429)."
            elif exc.code == 403:
                last_error_message = "RapidAPI subscription or API key access forbidden (HTTP 403)."
            elif exc.code == 401:
                last_error_message = "RapidAPI key authentication failed (HTTP 401)."
            elif exc.code == 404:
                last_error_message = "Invalid PNR Number."

        except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
            logger.error("[PNR Verification] RapidAPI network timeout: %s", str(exc))
            last_error_message = "Verification service network timeout."
        except Exception as exc:
            logger.error("[PNR Verification] Unexpected exception: %s", str(exc))

    logger.warning("[PNR Verification] REJECTED PNR %s - Reason: %s", pnr_clean, last_error_message)
    return {
        "success": False,
        "verified": False,
        "message": last_error_message
    }


def verify_pnr(pnr_number) -> dict:
    """Primary service entrypoint for PNR verification."""
    pnr_str = str(pnr_number).strip() if pnr_number else ""
    return fetch_realtime_pnr(pnr_str)
