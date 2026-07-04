# RailSwap — Phase 4 Production Readiness (TODO)

## SECURITY (priority)
- [x] Add refresh token support using **httpOnly secure cookies** with rotation (cookies set/clear; refresh endpoint wiring pending)
- [ ] Implement JWT claims for role + update auth helpers
- [ ] Add RBAC/admin middleware (role_required)
- [ ] Add security headers middleware (HelmetAction equivalent)
- [ ] Tighten CORS (no wildcard when credentials enabled)
- [ ] Add rate limiting (auth, ticket verify, uploads, payments)
- [ ] Harden PDF upload validation (signature/MIME checks + strict size limits)
- [ ] Update frontend auth handling (stop using localStorage for refresh; support cookie refresh)

## DATABASE OPTIMIZATION
- [ ] Identify list/query endpoints; add indexes and pagination
- [ ] Add FK constraints + cascade delete rules
- [ ] Prepare migrations + seed data

## PERFORMANCE
- [ ] Add Redis caching for safe endpoints
- [ ] Optimize queries (avoid N+1), add compression
- [ ] Frontend loading skeletons + optimistic UI where safe

## ERROR HANDLING
- [ ] Global JSON error handler + JWT/rate-limit specific errors
- [ ] Next.js 404/500 pages; retry/offline handling in network layer

## LOGGING
- [ ] Structured application/auth/payment/admin logs + correlation IDs

## TESTING
- [ ] Unit/API/integration/auth/payment/matching/database tests

## ADMIN IMPROVEMENTS
- [ ] Analytics + dashboards + export CSV + admin workflows

## NOTIFICATIONS
- [ ] Email + in-app + real-time notifications hooks

## DOCUMENTATION
- [ ] README + API docs + DB docs + deployment/developer guides

## DEPLOYMENT
- [ ] Dockerfile + docker-compose + Nginx + HTTPS + env templates

## FINAL QA
- [ ] Validate end-to-end flows including refresh, uploads, payments, refunds, admin review

