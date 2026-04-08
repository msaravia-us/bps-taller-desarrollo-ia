# Workshop: Desarrollo con IA en Cursor

Guia rapida para levantar el proyecto completo (backend + frontend).

La letra del ejercicio esta en `EJERCICIO_PRACTICO.md`.

## Estructura

- `./backend` API (Node.js + Express + Prisma + SQLite)
- `./frontend` app Next.js (App Router)

## Variables de entorno (backend)

1. Desde `backend/`, copiá la plantilla:

```bash
cd backend
cp .env.example .env
```

En Windows (PowerShell), podés usar: `Copy-Item .env.example .env`

2. Editá `backend/.env` con al menos:

| Variable       | Descripción |
|----------------|-------------|
| `DATABASE_URL` | Cadena de conexión SQLite. Por defecto `file:./dev.db` (archivo creado al migrar). |
| `JWT_SECRET`   | Secreto para firmar JWT. En local puede ser un string fijo de desarrollo; en producción debe ser único y seguro. |
| `PORT`         | Opcional. Puerto HTTP (por defecto **3000**). Si lo cambiás, actualizá `NEXT_PUBLIC_API_URL` en el frontend. |

## Levantar backend

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Validar:

- API en `http://localhost:3000` (o el puerto definido en `PORT`)
- Swagger en `http://localhost:3000/swagger` (mismo host/puerto)

## Levantar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Luego configurar `NEXT_PUBLIC_API_URL` en `frontend/.env.local` segun corresponda.

Validar:

- Frontend en `http://localhost:3001` (o el puerto que muestre Next.js)

