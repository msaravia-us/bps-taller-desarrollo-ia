---
name: list-view-nextjs-shadcn
description: Crea vistas de listado para esta aplicacion usando Next.js App Router y componentes shadcn/ui. Use when implementing index pages like listado de issues, listado de proyectos, tablas con filtros, busqueda, estados vacios, y acciones de fila.
---

# List View Next.js + shadcn

Genera una vista de listado consistente para esta aplicacion (por ejemplo issues o proyectos), con App Router y composicion de componentes shadcn.

## Cuando aplicar esta skill

- El usuario pide "crear una vista", "listado", "tabla", "index" o "pantalla de listado".
- El dominio es una coleccion (issues, proyectos, tareas, etc.).
- Se necesita UI de lectura: filtros, busqueda, paginacion simple, estados vacios y loading.

## Reglas base

1. Usar App Router (`app/.../page.tsx`) como entrypoint de la pantalla.
2. Preferir Server Component para la pagina; mover interaccion a componentes client cuando haga falta.
3. Usar componentes shadcn antes de markup custom (`Card`, `Table`, `Input`, `Button`, `Badge`, `Skeleton`, `Empty`, `Separator`).
4. Usar estilos semanticos y utilidades de layout (`flex`, `gap-*`), evitar estilos hardcodeados.
5. Mantener la vista desacoplada del fetch: page carga datos y la vista renderiza.

## Estructura sugerida

Para una entidad `projects`:

```txt
frontend/app/(app)/projects/page.tsx
frontend/components/projects/projects-list-view.tsx
frontend/components/projects/projects-list-skeleton.tsx
frontend/lib/api/projects.ts            # si no existe el endpoint helper
frontend/lib/api/types.ts               # tipos compartidos
```

## Workflow

Copia este checklist y avanza en orden:

```txt
List View Task Progress
- [ ] 1) Definir ruta y contrato de datos (campos por fila)
- [ ] 2) Crear page server-side y cargar datos
- [ ] 3) Crear componente de vista (tabla/lista)
- [ ] 4) Implementar estados: loading, empty, error
- [ ] 5) Agregar filtros/busqueda inicial
- [ ] 6) Validar accesibilidad y consistencia visual
```

### 1) Definir contrato de fila

Antes de maquetar, cerrar los campos minimos:

- `id` (clave estable)
- `title/name` (columna principal)
- `status` (badge o etiqueta)
- `updatedAt` (fecha)
- `owner/assignee` (si aplica)

Si faltan campos en tipos, agregarlos en `frontend/lib/api/types.ts`.

### 2) Page en App Router

En `page.tsx`:

- Cargar datos con helper de `frontend/lib/api/*`.
- Parsear `searchParams` para filtro/busqueda si aplica.
- Renderizar header de pagina + componente `*-list-view`.

Patron recomendado:

```tsx
// Server Component page
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const projects = await listProjects({ q, status });

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <ProjectsListView items={projects} query={q ?? ""} status={status ?? "all"} />
    </div>
  );
}
```

### 3) Componente de listado

`*-list-view.tsx` debe:

- Recibir `items` tipados por props.
- Mostrar filtros simples en la cabecera (input + select/toggles).
- Renderizar tabla con columnas claras y acciones de fila.
- Navegar a detalle/edicion con `Link`.

Composicion sugerida:

- Contenedor: `Card` + `CardHeader` + `CardContent`
- Filtros: `Input` + `Button` o control shadcn equivalente
- Tabla: `Table` y subcomponentes
- Estado vacio: `Empty`
- Loading: `Skeleton` (componente separado)

### 4) Estados obligatorios

- **Loading:** skeleton de tabla/lista.
- **Empty:** mensaje claro + CTA primaria.
- **Error:** mensaje de fallo de carga con accion de reintento o volver.

## Criterios de calidad

- No usar patrones Pages Router (`getServerSideProps`, `next/router`).
- Si hay hooks/event handlers, mover a componente con `"use client"`.
- Mantener imports del alias real del proyecto (`@/...` o el configurado).
- Evitar logica de negocio pesada en la UI.
- Evitar duplicar layout entre listados: reutilizar patrones y subcomponentes.

## Plantilla de secciones UI

Usar este orden:

1. Titulo + descripcion + accion primaria ("Nuevo ...")
2. Barra de filtros (busqueda, estado, orden)
3. Contenido principal (tabla/lista)
4. Footer opcional (conteo, paginacion)

## Integracion con otras skills

- Para convenciones App Router y data patterns: usar skill `nextjs`.
- Para composicion/estilos de componentes: usar skill `shadcn`.

Si hay duda de componente shadcn disponible, consultar docs antes de inventar markup custom.
