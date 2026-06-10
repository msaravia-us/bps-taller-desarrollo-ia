# AGENTS.md

## Project overview

Workshop Issue Tracker monorepo:

- `backend/` — Express 5 + Prisma + SQLite API (default port **3000**)
- `frontend/` — Next.js 16 App Router UI (typically port **3001** when backend uses 3000)

See `README.md` for full setup steps.

## Cursor Cloud specific instructions

### First-time / fresh database setup

`backend/.env` is not committed. If missing, create it with:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=3000
```

Copy `frontend/.env.example` to `frontend/.env` if missing (`NEXT_PUBLIC_API_URL=http://localhost:3000`).

After installing backend dependencies, run migrations and seed once:

```bash
cd backend && npm run prisma:migrate && npm run prisma:seed
```

`prisma:migrate` is interactive on first run; use `npx prisma migrate deploy` if you only need to apply existing migrations non-interactively.

### Running services

Start **backend first**, then **frontend** (Next.js auto-selects port 3001 when 3000 is taken).

| Service | Command | URL |
|---------|---------|-----|
| Backend API | `cd backend && npm run dev` | http://localhost:3000 |
| Swagger | (bundled with backend) | http://localhost:3000/swagger |
| Frontend | `cd frontend && npm run dev` | http://localhost:3001 |

Health check: `curl http://localhost:3000/health` → `{"ok":true}`

### Lint / build / tests

| Package | Lint | Build | Tests |
|---------|------|-------|-------|
| `frontend/` | `npm run lint` | `npm run build` | none in repo |
| `backend/` | none configured | N/A (`npm start` for prod) | none in repo |

### Seed users (email-only auth, no password)

- `ana@workshop.dev` (owner of "Workshop Tracker" / WST)
- `leo@workshop.dev`

### Gotchas

- No Docker or external DB — SQLite file is `backend/dev.db` (gitignored).
- `backend/.env.example` is referenced in README but not present in the repo; use the values above.
- Frontend has its own `frontend/AGENTS.md` with Next.js 16 breaking-change notes — read it before editing frontend code.
- Re-running `prisma:seed` wipes and recreates demo data.
