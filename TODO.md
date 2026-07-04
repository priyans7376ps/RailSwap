# RailSwap - Refactor Auth + Routing + Hydration Fix (Next.js App Router)

- [ ] Add `src/context/AuthContext.jsx` implementing AuthProvider (single source of truth) with hydration-safe startup auth check.
- [ ] Add `src/hooks/useAuth.js`.
- [ ] Add `src/components/RequireAuth.jsx` and `src/components/RequireAdmin.jsx` using Auth Context + authLoading.
- [ ] Refactor `src/app/layout.jsx` to use `AuthProvider` (remove/replace `UserProvider`).
- [ ] Refactor `src/components/AuthLinks.jsx` to use Auth Context only; use authLoading to avoid SSR/CSR flip.
- [ ] Refactor `src/app/protected/requireAuth.js` to use Auth Context (remove localStorage/JWT reads).
- [ ] Refactor `src/app/admin/protected/requireAdminAuth.js` to use Auth Context; non-admin must show 403 Forbidden.
- [ ] Refactor `src/services/api.js` to stop reading `localStorage` / `typeof window` during render paths; isolate token reads to effect-only usage.
- [ ] Update protected pages (dashboard/profile/chat/upload/search/verify) to use new guard components.
- [ ] Add minimal `src/app/loading.tsx`, `src/app/error.jsx`, `src/app/not-found.jsx` if missing, ensuring App Router best practices.
- [ ] Remove/stop using `UserContext` (either delete or keep unused). Ensure no references remain.
- [ ] Verify: `npm run lint` and `npm run build` in `frontend` show no hydration warnings.

