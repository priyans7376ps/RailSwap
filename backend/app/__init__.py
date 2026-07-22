"""
Package initializer for backend/app directory.
Exposes create_app from backend/app.py for compatibility.
"""
from pathlib import Path
import importlib.util

_app_py = Path(__file__).resolve().parent.parent / "app.py"
if _app_py.exists():
    _spec = importlib.util.spec_from_file_location("app_main_module", str(_app_py))
    _mod = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_mod)
    create_app = getattr(_mod, "create_app", None)
