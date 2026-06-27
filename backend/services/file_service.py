import os
from uuid import uuid4

from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {"pdf"}


def allowed_ticket_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_ticket_pdf(file_storage, upload_folder):
    if not file_storage or not file_storage.filename:
        return None
    if not allowed_ticket_file(file_storage.filename):
        raise ValueError("Only PDF ticket uploads are allowed")

    original_name = secure_filename(file_storage.filename)
    filename = f"{uuid4().hex}_{original_name}"
    os.makedirs(upload_folder, exist_ok=True)
    destination = os.path.join(upload_folder, filename)
    file_storage.save(destination)
    return filename
