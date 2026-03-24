# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vietnamese-language full-stack university student activity management platform. Polyglot multi-service monorepo with three independent services communicating over HTTP:

| Service | Path | Port | Stack |
|---------|------|------|-------|
| Backend API | `backend/` | 3000 | Node.js + Express + Prisma + Redis/BullMQ |
| Frontend | `frontend/eventfe/` | 3002 | Next.js 16 (App Router) + shadcn/ui + TanStack Query |
| AI Service | `ai-service/` | 3001 | Python FastAPI + Gemini SDK |
| Infrastructure | `environment/start/` | - | Docker Compose (PostgreSQL 16 + Redis 7) |

## Development Commands

### Infrastructure
```bash
cd environment/start && docker compose up -d     # Start PostgreSQL + Redis
cd environment/start && docker compose down -v  # Stop + wipe data
```

### Backend
```bash
cd backend
npm run dev       # nodemon with --inspect (port 3000)
npm start         # Production
npm run seed      # Seed DB with test data (creates ~20 test accounts)
npm run test:api  # Run API integration tests (test-api.js)
npx prisma generate
npx prisma db push     # Push schema changes (dev)
npx prisma migrate deploy  # Apply migrations (prod)
npx prisma studio    # GUI DB browser
```

### Frontend
```bash
cd frontend/eventfe
npm run dev    # next dev -p 3002
npm run build  # next build
npm run lint   # ESLint (flat config)
```

### AI Service
```bash
cd ai-service
# First time: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

## Architecture

### Backend — Layered Module Pattern

Each feature module in `src/modules/<name>/` follows a strict 4-layer pattern:

```
*.route.js      → Express router, chains middleware, delegates to controller
*.controller.js → Request/response handling, calls service, formats response
*.service.js    → Business logic, Prisma queries
*.validation.js → Joi schemas for input validation
```

Middleware chain on routes: `validateMw → authMw → roleMw → controller`

Key modules: `auth`, `users`, `organizations`, `activities`, `registrations`, `club-applications`, `notifications`, `admin`, `ai`, `chat-sessions`, `uploads`, `system-config`, `university`, `forms`

### Frontend — Service + Hook + Type

- API clients in `src/services/` — typed fetch wrappers returning `ApiResponse<T>`
- Custom hooks in `src/hooks/` wrap services with TanStack Query
- Zod schemas in `src/types/` generate `api.generated.ts` for runtime validation
- Route groups under `src/app/`: `(main)/` (public/auth), `admin/`, `organization/`, `auth/`
- UI components: `src/components/ui/` (shadcn) and `src/components/ui-custom/` (custom)

### AI Service — Router-per-feature

Each `modules/<name>/router.py` is a FastAPI router registered in `app.py`. Features: search, recommend, ask, scan_id, geo_attendance, chatbot.

### Database

Prisma ORM with PostgreSQL. 30+ models. Soft deletes via `isDeleted`/`deletedAt` flags. Integer primary keys (`@default(autoincrement())`), not UUID.

## Environment Setup

### Backend `.env`
```
DATABASE_URL, JWT_SECRET, PORT, NODE_ENV
MAIL_*, REDIS_*, AWS_*, AI_SERVICE_URL, AI_SERVICE_SECRET
```

### Frontend `.env.local`
```
NEXT_PUBLIC_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3000/api
COOKIE_ACCESS_TOKEN_MAX_AGE=900, COOKIE_REFRESH_TOKEN_MAX_AGE=604800
```

### AI Service `.env`
```
PORT=3001, GEMINI_API_KEY, GEMINI_MODEL, AI_SERVICE_SECRET
```

## Test Accounts (after seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Leader | leader1@test.com | Leader@123 |
| Student | student1@test.com | Student@123 |

## Notable Config

- ESLint 9 flat config in frontend only (no backend linting)
- No Prettier configured anywhere
- Frontend uses both `package-lock.json` and `pnpm-lock.yaml` — prefer `npm` scripts as documented
- `src/configs/http.comfig.ts` has a typo in filename (do not rename — change would affect imports)
- No E2E tests or coverage tool configured
- Docker compose also exists at `backend/docker-compose.yml` (legacy, prefer `environment/start/`)
