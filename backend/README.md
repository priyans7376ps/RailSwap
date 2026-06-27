# RailSwap Backend

Smart Train Ticket Exchange Marketplace backend built with Flask, SQLAlchemy, PostgreSQL, JWT authentication, Flask-Migrate, and Flask-CORS.

## Folder Structure

```text
backend/
├── app.py
├── config/
│   ├── __init__.py
│   ├── config.py
│   └── database.py
├── models/
│   ├── __init__.py
│   ├── message_model.py
│   ├── rating_model.py
│   ├── ticket_model.py
│   ├── transaction_model.py
│   └── user_model.py
├── routes/
│   ├── __init__.py
│   ├── auth_routes.py
│   ├── chat_routes.py
│   ├── matching_routes.py
│   ├── payment_routes.py
│   ├── rating_routes.py
│   ├── search_routes.py
│   ├── ticket_routes.py
│   ├── user_routes.py
│   └── verification_routes.py
├── services/
│   ├── __init__.py
│   ├── file_service.py
│   ├── matching_service.py
│   ├── notification_service.py
│   ├── payment_service.py
│   └── pnr_service.py
├── utils/
│   ├── __init__.py
│   ├── jwt_helper.py
│   ├── response.py
│   └── validators.py
├── uploads/
│   └── tickets/
├── migrations/
│   └── .gitkeep
├── requirements.txt
└── README.md
```

## Environment Variables

```bash
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=replace-with-a-long-random-secret
JWT_SECRET_KEY=replace-with-a-long-random-jwt-secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/railswap
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=1440
CORS_ORIGINS=*
UPLOAD_FOLDER=uploads/tickets
MAX_CONTENT_LENGTH_BYTES=5242880
```

## Database Setup

```bash
createdb railswap
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask db init
flask db migrate -m "Initial RailSwap schema"
flask db upgrade
```

If `flask db init` says the migrations directory already exists, continue with `flask db migrate` after ensuring the directory only contains local migration files you want to keep.

## Run Instructions

```bash
cd backend
venv\Scripts\activate
flask run
```

Health check:

```http
GET /api/health
```

## API Summary

Protected routes require:

```http
Authorization: Bearer <access_token>
```

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

User:

- `GET /api/user/profile`
- `PUT /api/user/profile`

Ticket verification:

- `POST /api/ticket/verify`

```json
{
  "pnr_number": "1234567890"
}
```

Tickets:

- `POST /api/tickets/create`
- `GET /api/tickets/<ticket_id>`

Ticket creation expects `multipart/form-data` with ticket fields and optional `ticket_pdf` PDF upload.

Search and matching:

- `GET /api/tickets/search?source=NDLS&destination=BPL&date=2026-07-01&class=CC&gender=any`
- `GET /api/matching/tickets?source=NDLS&destination=BPL&date=2026-07-01&class=CC&gender=any`

Payment:

- `POST /api/payment/start`
- `POST /api/payment/confirm`
- `POST /api/payment/cancel`

Payment workflow:

1. Buyer starts payment.
2. Transaction status becomes `held`.
3. Ticket status becomes `matched`.
4. Buyer confirms after receiving ticket.
5. Transaction becomes `completed` and ticket becomes `completed`.
6. If cancelled while held, transaction becomes `refunded` and the ticket returns to `active`.

Chat:

- `POST /api/chat/send`
- `GET /api/chat/messages?receiver_id=<user_id>`

Rating:

- `POST /api/rating/create`

## Response Format

Success:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": ""
}
```

## Production Notes

- Replace `pnr_service.py` mock verification with an approved railway data provider.
- Replace `payment_service.py` payment hold simulation with a PCI-compliant gateway integration.
- Send notifications asynchronously through a queue worker before scaling.
- Store uploaded PDFs in object storage such as S3, not local disk, for multi-instance deployments.
- Set strong secrets and specific CORS origins in production.
