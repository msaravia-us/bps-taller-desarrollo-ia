# Issue Tracker – Monorepo

Two-service monorepo: `backend/` (Express + Prisma + SQLite) and `frontend/` (Next.js 16 + shadcn/ui).

## Cursor Cloud specific instructions

### Services overview

| Service | Directory | Port | Start command |
|---------|-----------|------|---------------|
| Backend API | `backend/` | 3000 | `npm run dev` |
| Frontend | `frontend/` | 3001 | `npm run dev -- -p 3001` |

Start the backend **before** the frontend — the frontend calls the API at `http://localhost:3000` (configured via `NEXT_PUBLIC_API_URL` in `frontend/.env.local`).

### Environment files (not committed)

- `backend/.env` — requires `DATABASE_URL="file:./dev.db"`, optionally `JWT_SECRET` (defaults to `"dev-secret"`) and `PORT` (defaults to `3000`).
- `frontend/.env.local` — copy from `frontend/.env.example`; sets `NEXT_PUBLIC_API_URL=http://localhost:3000`.

### First-time setup after dependency install

```bash
cd backend && npm run prisma:migrate && npm run prisma:seed
```

`prisma:migrate` creates the SQLite file and applies migrations. `prisma:seed` loads sample users (`ana@workshop.dev`, `leo@workshop.dev`), a project, issue, and comment.

### Lint

```bash
cd frontend && npm run lint
```

Backend has no lint script.

### Gotchas

- The backend routes have **no** `/api` prefix — endpoints are `/auth/register`, `/projects`, etc.
- The registration schema field is `displayName` (not `name`).
- Frontend uses Next.js 16 which has breaking API changes. Always check `node_modules/next/dist/docs/` before writing frontend code.
- SQLite DB file lives at `backend/dev.db`; deleting it and re-running `prisma:migrate` resets the database.
