# Práctico 3: MCPs y worktrees

Este ejercicio combina tres piezas: configurar y probar el MCP de GitHub, preparar worktrees en Cursor y cerrar el flujo con una implementación en paralelo y un pull request.

---

## Objetivos

- Configurar el servidor MCP de GitHub en Cursor usando el PAT provisto.
- Verificar que el agente puede consultar el repositorio (issues, PRs) mediante las herramientas MCP.
- Añadir en el proyecto el archivo `.cursor/worktrees.json` con la configuración oficial del curso (ver abajo).
- Leer el issue asignado usando el MCP (o instruyendo al agente para que use esas herramientas).
- Ejecutar best-of-n sobre worktrees para implementar el issue, comparar resultados y quedarse con la mejor variante.
- Crear el pull request hacia la rama acordada, otra vez apoyándose en el MCP de GitHub.

---

## Parte 1 — Configurar y probar el MCP de GitHub

1. Ir a la [documentación oficial del MCP de GitHub para Cursor](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) y seguir los pasos para instalar el MCP remoto de GitHub.
2. En la configuración, reemplazar donde dice YOUR_GITHUB_PAT por el token de acceso personal (PAT) que se te proporcionó.
3. Ir a los ajustes de Cursor y en la sección `Tools & MCPs` verificar que el MCP de GitHub esté instalado y funcionando.
4. Probar el MCP de GitHub. Para esto pedirle al agente que liste los issues abiertos del repositorio del workshop.

---

## Parte 2 — Configurar worktrees

En la raíz del repositorio, creá el archivo `.cursor/worktrees.json` con el siguiente contenido:

```json
{
  "setup-worktree-windows": [
    "cd frontend && npm ci && cd ..",
    "cd backend && npm ci && npm run prisma:generate && cd ..",
    "if exist \"%ROOT_WORKTREE_PATH%\\frontend\\.env\" copy /Y \"%ROOT_WORKTREE_PATH%\\frontend\\.env\" \"frontend\\.env\"",
    "if exist \"%ROOT_WORKTREE_PATH%\\backend\\.env\" copy /Y \"%ROOT_WORKTREE_PATH%\\backend\\.env\" \"backend\\.env\""
  ]
}
```

---

## Parte 3 — Implementar el issue usando worktrees

1. Pedirle al agente que obtenga el detalle del issue del frontend para los comentarios (issue #3). El agente debería usar el MCP de GitHub para obtener el detalle del issue.
2. Una vez que el agente haya obtenido el detalle del issue, pedirle al agente que use worktrees para implementar el issue. Para esto pedir `/best-of-n gpt, sonnet, composer`.
3. Revisar los resultados de los tres modelos y elegir la mejor variante.
4. Pedirle al agente que cree el pull request con la variante elegida. Asegurarse de que los cambios se hayan aplicado en una rama nueva.
5. Verificar en la interfaz de GitHub que el PR se vea correctamente.