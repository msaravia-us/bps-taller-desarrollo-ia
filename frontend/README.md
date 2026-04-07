# Issue Tracker (frontend)

Next.js App Router UI for the workshop API in `/backend`. Stack: TypeScript, Tailwind CSS v4, and [shadcn/ui](https://ui.shadcn.com/) (base preset).

## Prerequisites

- Node.js 20+ recommended
- API running and reachable from the browser (CORS is enabled on the API)

## Port conflict (important)

Both this template and the Express API default to **port 3000**. For local development, run the **API on another port** (for example **3001**) and keep Next.js on **3000**.

In the backend project, set in `.env`:

```bash
PORT=3001
```

Then point the frontend at that URL (see below).

## Configuration

1. Copy `.env.local.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to your API origin **without** a trailing slash, for example `http://localhost:3001`.

The app reads the JWT from `localStorage` and sends `Authorization: Bearer <token>` on authenticated requests.

## Scripts

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should be redirected to `/login` or `/projects` depending on whether a token is stored.

```bash
npm run build
npm start
```

Production build expects `NEXT_PUBLIC_API_URL` to be set in the environment.

## Routes

| Path | Description |
|------|-------------|
| `/login`, `/register` | Email auth against `/auth/login` and `/auth/register` |
| `/projects` | List and create projects |
| `/projects/[projectId]` | Project detail, members, labels; owners can edit, invite, delete |
| `/projects/[projectId]/issues` | Filterable issue list, pagination, create issue / label |
| `/issues/[issueId]` | Edit issue, labels, assignee; comments with author-only edit |

API reference: `GET /swagger` on the backend when it is running.

