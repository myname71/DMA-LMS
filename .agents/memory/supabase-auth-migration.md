---
name: Supabase Auth Migration
description: How auth was migrated from SHA-256 + sessions Map to Supabase Auth with legacy fallback
---

## Rule
Backend uses async `verifySupabaseToken()` calling `${SUPABASE_URL}/auth/v1/user` with service role key.
All route handlers must be `async`, all auth helpers must be `await`-ed.
Pattern: `const session = await requireAdmin(req, res); if (!session) return;`

**Why:** `requireAdmin`/`requirePermission`/`requireSession` return `Promise<session | null>` — calling without await returns a Promise (truthy), bypassing auth silently.

**How to apply:** Any new route that needs auth must use the awaited pattern above. Never call these sync.

## Frontend Auth Flow
1. Login: try `supabase.auth.signInWithPassword()` first → fall back to `/api/auth/login` for demo/seed accounts
2. Register: `supabase.auth.signUp()` + `/api/auth/register` (dual-write)
3. Session restore: `supabase.auth.getSession()` first → fall back to `dma_auth_session` localStorage token
4. Logout: `supabase.auth.signOut()` + remove `dma_auth_session` from storage

## Demo Accounts
Legacy SHA-256 accounts (student/instructor/admin/superadmin @digitalmanufacturing.academy, password "demo") still work via legacy fallback. New real users go through Supabase.

## Env Vars
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` — shared (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — secret (backend only, never expose to client)
