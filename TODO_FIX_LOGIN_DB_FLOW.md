# TODO - Fix login/signup DB flow

## Goal
Ensure signup and login use the exact same DB configured via `DATABASE_URL` (no duplicate SQLite DB paths).

## Steps
- [ ] Add startup logging for effective `SQLALCHEMY_DATABASE_URI`.
- [ ] Ensure DB init uses only `app.config['SQLALCHEMY_DATABASE_URI']` (single centralized config).
- [ ] Verify registration endpoint writes to the same DB that login reads from.
- [ ] Add a quick verification after signup in logs (email exists check).
- [ ] Restart backend, run Signup -> Login -> Dashboard flow.

