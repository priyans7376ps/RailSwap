# TODO_ADMIN_PORTAL.md

## Step 1 — Backend: RBAC data model
- [x] Add `role` column to `users` (recommended) and ensure default role is `user`.
- [ ] Provide migration / update for SQLite + production DB.


## Step 2 — Backend: Admin auth endpoints
- [ ] Create `/api/admin/auth/login`:
  - [ ] If credentials valid and user role is `admin` => issue JWT.
  - [ ] If credentials valid but role is not admin => return `Access Denied`.
- [ ] Create `/api/admin/auth/logout` (clear client token).

## Step 3 — Backend: RBAC enforcement middleware/decorators
- [ ] Implement `admin_required` decorator using existing `jwt_role_required(['admin'])`.
- [ ] Ensure all `/api/admin/*` routes use `@admin_required`.

## Step 4 — Backend: Admin APIs + data endpoints
- [ ] KPI endpoints for totals + revenue/refunds/fraud placeholders based on existing schema.
- [ ] Implement minimal but complete set of endpoints for:
  - users, tickets, verification, transactions, payments, reports, analytics, notifications, settings, logs
- [ ] Ensure non-admin calls return 403.

## Step 5 — Frontend: Admin portal scaffolding
- [x] Create `frontend/src/app/admin/layout.jsx` (separate from user layout).
- [x] Create Admin sidebar + navbar components under `frontend/src/components/admin/`.
- [x] Create `frontend/src/app/admin/login/page.jsx` with `Access Denied` UI.
- [x] Create `frontend/src/app/admin/protected/requireAdminAuth.js`.


## Step 6 — Frontend: Admin pages + routing
- [ ] Create pages for:
  - dashboard, users, tickets, verification, transactions, payments, reports, analytics, notifications, settings, logs
- [ ] Wire each page to corresponding `/api/admin/*` endpoints.

## Step 7 — Frontend: RBAC safety
- [ ] Ensure user cannot reach admin pages (redirect or block).

## Step 8 — Testing instructions
- [ ] Create/seed at least one admin account.
- [ ] Test:
  - [ ] Normal user login + /admin/* => blocked
  - [ ] Normal user calling /api/admin/* => 403
  - [ ] Admin login + /admin/dashboard => works

