## Cursor Cloud specific instructions

This is an Issue Tracker app (backend + frontend, no monorepo tooling).

### Services

| Service | Dir | Port | Start command |
|---------|-----|------|---------------|
| Backend API (Express + Prisma + SQLite) | `backend/` | 3000 | `npm run dev` |
| Frontend (Next.js App Router) | `frontend/` | 3001 | `npm run dev` |

### Environment files (not committed)

- `backend/.env` — requires `DATABASE_URL=file:./dev.db`, `JWT_SECRET=<any string>`, optional `PORT` (default 3000).
- `frontend/.env` — requires `NEXT_PUBLIC_API_URL=http://localhost:3000`. Copy from `frontend/.env.example`.

### First-time database setup

After `npm install` in `backend/`, run:
```
npm run prisma:migrate
npm run prisma:seed
```
This creates `backend/dev.db` (SQLite) with seed data. Subsequent runs only need migrate if schema changes.

### Lint / Build / Test

- **Lint (frontend):** `npm run lint` in `frontend/`
- **Build (frontend):** `npm run build` in `frontend/`
- No automated test suite exists in the repo currently.

### Gotchas

- The backend uses Express v5 (not v4). Route handlers return promises; no `next(err)` wrappers needed.
- Auth is email + displayName only (no password field in registration). JWT tokens are returned on register/login.
- The frontend uses Next.js 16 with breaking changes from earlier versions. Check `node_modules/next/dist/docs/` before modifying Next.js-specific code.
- SQLite DB file is at `backend/dev.db`. If you need a clean slate, delete it and re-run `prisma:migrate` + `prisma:seed`.
- Backend `prisma:migrate` runs `prisma migrate dev` which is interactive by default. Use `--name <name>` flag to avoid prompts.
