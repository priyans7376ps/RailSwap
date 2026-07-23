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


def fetch_realtime_pnr(pnr_str: str) -> dict:
    """
    Call RailKit PNR Status API to fetch live details for a 10-digit PNR.
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
    api_key = os.getenv("RAILKIT_API_KEY", "").strip()
    base_url = os.getenv(
        "RAILKIT_BASE_URL",
        "https://railkit-api.rajivdubey.dev"
    ).strip().rstrip("/")

    if not api_key or api_key == "YOUR_RAILKIT_API_KEY":
        logger.error("[PNR Verification] RailKit API key missing or unconfigured in backend/.env")
        return {
            "success": False,
            "verified": False,
            "message": "RailKit API key not configured."
        }

    # 3. Single Endpoint Setup
    api_url = f"{base_url}/api/checkPNRStatus/{pnr_clean}"
    headers = {
        "x-api-key": api_key,
        "accept": "application/json"
    }

    last_error_message = "Invalid PNR Number."

    logger.info("[PNR Verification] Requesting RailKit -> %s", api_url)

    try:
        req = urllib.request.Request(api_url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=8) as response:
            status_code = response.status
            raw_data = response.read().decode("utf-8")
            
            logger.info("[PNR Verification] HTTP %s from RailKit for PNR: %s", status_code, pnr_clean)

            try:
                payload = json.loads(raw_data)
            except json.JSONDecodeError as exc:
                logger.error("[PNR Verification] JSON parse error: %s", str(exc))
                return {
                    "success": False,
                    "verified": False,
                    "message": "Invalid response format from service."
                }

            if isinstance(payload, dict):
                if payload.get("status") is False or payload.get("success") is False or payload.get("flag") is False:
                    err_msg = payload.get("message") or payload.get("error")
                    if err_msg:
                        last_error_message = str(err_msg)
                    return {
                        "success": False,
                        "verified": False,
                        "message": last_error_message
                    }

            # --- RailKit Response Field Extraction ---
            data = payload.get("data", {}) if isinstance(payload, dict) else {}

            train = data.get("train", {}) if isinstance(data, dict) else {}
            journey = data.get("journey", {}) if isinstance(data, dict) else {}

            source_station = journey.get("source", {}) if isinstance(journey, dict) else {}
            destination_station = journey.get("destination", {}) if isinstance(journey, dict) else {}

            train_number = str(train.get("number", "")).strip() if isinstance(train, dict) else ""
            train_name = str(train.get("name", "")).strip() if isinstance(train, dict) else ""

            source = str(source_station.get("name", "")).strip() if isinstance(source_station, dict) else ""
            destination = str(destination_station.get("name", "")).strip() if isinstance(destination_station, dict) else ""

            journey_date = str(journey.get("dateOfJourney", "")).strip() if isinstance(journey, dict) else ""

            if not train_number:
                logger.warning("[PNR Verification] RailKit payload missing train number for PNR %s", pnr_clean)
                return {
                    "success": False,
                    "verified": False,
                    "message": "Invalid PNR Number."
                }

            logger.info("[PNR Verification] SUCCESS - Live PNR %s verified via RailKit", pnr_clean)
            return {
                "success": True,
                "verified": True,
                "pnr": pnr_clean,
                "train_number": train_number,
                "train_name": train_name,
                "source": source,
                "destination": destination,
                "journey_date": journey_date,
                "message": "PNR verified successfully."
            }

    except urllib.error.HTTPError as exc:
        logger.error("[PNR Verification] RailKit HTTP Error %s for URL %s", exc.code, api_url)
        if exc.code == 429:
            last_error_message = "RailKit rate limit exceeded."
        elif exc.code == 403:
            last_error_message = "RailKit access forbidden."
        elif exc.code == 401:
            last_error_message = "RailKit authentication failed."
        elif exc.code == 404:
            last_error_message = "Invalid PNR Number."

    except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
        logger.error("[PNR Verification] RailKit network timeout: %s", str(exc))
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