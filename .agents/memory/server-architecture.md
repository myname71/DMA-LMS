---
name: Server architecture
description: How the DMA backend is structured — db_state.json primary, MySQL via MYSQL_DATABASE_URL
---

# DMA Server Architecture

## Current data layer
- **server.ts** is the single monolithic server — handles ALL routes inline, no route file imports
- **db_state.json** is the live data store; loaded into memory on startup, saved on every mutation
- Route files (`routes/*.ts`) exist but are NOT imported — they are the MySQL/Prisma-ready future
- config/prisma.ts creates PrismaClient only if `MYSQL_DATABASE_URL` starts with `mysql://`

## How to switch to MySQL (Hostinger)
1. Set `MYSQL_DATABASE_URL=mysql://user:pass@host:port/dbname` as a secret
2. Run `npm run db:push` to push schema to MySQL
3. Run `npm run db:seed` to seed admin users + Course 101
4. The Prisma route files will then be used by importing them in server.ts

## Key endpoints
- `GET /api/db-state` — bulk state for frontend (auth-gated for sensitive data)
- `POST /api/courses/enroll` — body `{ courseId }` (legacy App.tsx format)
- `POST /api/courses/sync-progress` — body `{ userId, courseId, lessonId?, quizId?, score?, passed? }`

## Prisma version
- Prisma 5.22.0 (downgraded from 7.8.0 which had no MySQL adapter)
- Schema: `prisma/schema.prisma` with `url = env("MYSQL_DATABASE_URL")`
- prisma.config.ts: only sets datasource if MYSQL_DATABASE_URL exists

## Why db_state.json not MySQL by default
Replit's managed DATABASE_URL is PostgreSQL; user needs Hostinger MySQL credentials.
App works fully with db_state.json until MySQL is provided.
