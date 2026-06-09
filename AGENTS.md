# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Monorepo Issue Tracker workshop app: `backend/` (Express + Prisma + SQLite API) and `frontend/` (Next.js 16 App Router UI). See `README.md` for the full setup guide.

### Services and ports

| Service | Default URL | Start command |
|---------|-------------|---------------|
| Backend API | `http://localhost:3000` | `cd backend && npm run dev` |
| Frontend | `http://localhost:3001` | `cd frontend && npm run dev` |
| Swagger | `http://localhost:3000/swagger` | (served by backend) |

Start backend before frontend so Next.js picks port 3001 when 3000 is taken.

### First-time environment setup (not in update script)

`backend/.env` is **not committed** (and `backend/.env.example` is missing from the repo). Create `backend/.env` with at least:

```
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-workshop
PORT=3000
```

Copy frontend env: `cp frontend/.env.example frontend/.env` (`NEXT_PUBLIC_API_URL=http://localhost:3000`).

Initialize the database once per fresh clone:

```bash
cd backend
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed   # optional demo data (ana@workshop.dev, leo@workshop.dev)
```

Use `prisma migrate deploy` (not `prisma migrate dev`) in non-interactive/CI environments.

### Lint, test, build

- **Lint:** `cd frontend && npm run lint` (backend has no lint script)
- **Tests:** none in this repo
- **Build:** `cd frontend && npm run build`

### Seeded demo login

After `prisma:seed`, log in with email `ana@workshop.dev` (no password).
