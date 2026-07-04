---
name: Admin credentials and auth architecture
description: JWT cookie auth, admin user emails/passwords, role hierarchy
---

## JWT
- Cookie name: `dma_token`, payload: `{ id, email, role }`, 7-day expiry, HttpOnly, secure in prod
- Server reads cookie first, then `Authorization: Bearer` header as fallback

## Admin users (seeded on every startup in initializeState)
- Super Admin: `pandoratecllc@gmail.com` / `Dmamfg.2026` → role: `super_admin`
- Admin: `digitalmfg.2026@gmail.com` / `Dmamfg.2026` → role: `admin`
- Users with no `password` field get it auto-set to `Dmamfg.2026` hash on next startup

## Role hierarchy enforcement
- `super_admin` > `admin` > `instructor` > `student`
- Admin cannot modify/suspend/delete super_admin accounts
- Only super_admin can promote users to super_admin

## Course 101
- `id: c_101`, `isFree: true`, `price: 0` — enforced in initializeState() on every boot

## MySQL switch (when ready)
- Set `MYSQL_DATABASE_URL=mysql://...` as secret
- Run `npm run db:push && npm run db:seed`
- config/prisma.ts creates PrismaClient only if MYSQL_DATABASE_URL is set and starts with mysql://

## Prisma note
- Prisma 5.22.0 (NOT 7.x — v7 has no MySQL direct adapter)
- Schema: `prisma/schema.prisma` with `url = env("MYSQL_DATABASE_URL")`
