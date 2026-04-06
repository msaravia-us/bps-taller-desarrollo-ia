# Issue Tracker API

Backend REST en JavaScript.

## Stack

- Node.js + Express
- Prisma ORM
- SQLite (sin setup adicional)

## Puesta en marcha (5 minutos)

1. Instalar dependencias:

```bash
npm install
```

1. Crear base y aplicar migraciones:

```bash
npm run prisma:migrate
```

1. Cargar datos de ejemplo:

```bash
npm run prisma:seed
```

1. Levantar API:

```bash
npm run dev
```

API disponible en `http://localhost:3000`. Documentación interactiva (Swagger UI) en `http://localhost:3000/swagger`.

