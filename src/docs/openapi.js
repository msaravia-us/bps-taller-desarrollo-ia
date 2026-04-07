const { OpenAPIRegistry, OpenApiGeneratorV3 } = require("@asteasolutions/zod-to-openapi");
const { z } = require("zod");
const {
  registerSchema,
  loginSchema,
} = require("../modules/auth/auth.schemas");
const {
  projectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
} = require("../modules/projects/projects.schemas");
const {
  issueSchema,
  updateIssueSchema,
  issueQuerySchema,
  createLabelSchema,
} = require("../modules/issues/issues.schemas");
const {
  createCommentSchema,
  commentListQuerySchema,
} = require("../modules/comments/comments.schemas");

function getOpenApiSpec() {
  const registry = new OpenAPIRegistry();
  const projectIdParamSchema = z.object({ projectId: z.string() });
  const issueIdParamSchema = z.object({ issueId: z.string() });

  registry.register("RegisterRequest", registerSchema);
  registry.register("LoginRequest", loginSchema);
  registry.register("CreateProjectRequest", projectSchema);
  registry.register("UpdateProjectRequest", updateProjectSchema);
  registry.register("AddProjectMemberRequest", addProjectMemberSchema);
  registry.register("CreateIssueRequest", issueSchema);
  registry.register("UpdateIssueRequest", updateIssueSchema);
  registry.register("IssueQuery", issueQuerySchema);
  registry.register("CreateLabelRequest", createLabelSchema);
  registry.register("CreateCommentRequest", createCommentSchema);
  registry.register("CommentListQuery", commentListQuerySchema);

  registry.registerPath({
    method: "get",
    path: "/health",
    summary: "Health check",
    responses: { 200: { description: "API healthy" } },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/register",
    summary: "Registro de usuario (email + nombre)",
    request: { body: { content: { "application/json": { schema: registerSchema } } } },
    responses: { 201: { description: "Registered; body includes token and user" }, 409: { description: "User already exists" } },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/login",
    summary: "Login por email",
    request: { body: { content: { "application/json": { schema: loginSchema } } } },
    responses: { 200: { description: "token and user" }, 404: { description: "User not found" } },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/me",
    summary: "Usuario actual",
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: "Current user object under user key" }, 401: { description: "Unauthorized" } },
  });

  registry.registerPath({
    method: "get",
    path: "/projects",
    summary: "Listar proyectos del usuario",
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: "Lista de proyectos" } },
  });

  registry.registerPath({
    method: "post",
    path: "/projects",
    summary: "Crear proyecto",
    security: [{ bearerAuth: [] }],
    request: { body: { content: { "application/json": { schema: projectSchema } } } },
    responses: { 201: { description: "Proyecto creado" } },
  });

  registry.registerPath({
    method: "patch",
    path: "/projects/{projectId}",
    summary: "Actualizar proyecto",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
      body: { content: { "application/json": { schema: updateProjectSchema } } },
    },
    responses: { 200: { description: "Proyecto actualizado" } },
  });

  registry.registerPath({
    method: "delete",
    path: "/projects/{projectId}",
    summary: "Eliminar proyecto",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
    },
    responses: { 204: { description: "Proyecto eliminado" } },
  });

  registry.registerPath({
    method: "post",
    path: "/projects/{projectId}/members",
    summary: "Agregar o actualizar miembro del proyecto",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
      body: { content: { "application/json": { schema: addProjectMemberSchema } } },
    },
    responses: { 201: { description: "Membresía creada o actualizada" } },
  });

  registry.registerPath({
    method: "get",
    path: "/projects/{projectId}/issues",
    summary: "Listar issues del proyecto",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
      query: issueQuerySchema,
    },
    responses: { 200: { description: "Lista paginada de issues" } },
  });

  registry.registerPath({
    method: "post",
    path: "/projects/{projectId}/issues",
    summary: "Crear issue",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
      body: { content: { "application/json": { schema: issueSchema } } },
    },
    responses: { 201: { description: "Issue creada" } },
  });

  registry.registerPath({
    method: "post",
    path: "/projects/{projectId}/labels",
    summary: "Crear etiqueta de proyecto",
    security: [{ bearerAuth: [] }],
    request: {
      params: projectIdParamSchema,
      body: { content: { "application/json": { schema: createLabelSchema } } },
    },
    responses: { 201: { description: "Etiqueta creada" } },
  });

  registry.registerPath({
    method: "get",
    path: "/issues/{issueId}",
    summary: "Obtener issue",
    security: [{ bearerAuth: [] }],
    request: { params: issueIdParamSchema },
    responses: { 200: { description: "Issue" } },
  });

  registry.registerPath({
    method: "patch",
    path: "/issues/{issueId}",
    summary: "Actualizar issue",
    security: [{ bearerAuth: [] }],
    request: {
      params: issueIdParamSchema,
      body: { content: { "application/json": { schema: updateIssueSchema } } },
    },
    responses: { 200: { description: "Issue actualizada" } },
  });

  registry.registerPath({
    method: "delete",
    path: "/issues/{issueId}",
    summary: "Eliminar issue",
    security: [{ bearerAuth: [] }],
    request: { params: issueIdParamSchema },
    responses: { 204: { description: "Issue eliminada" } },
  });

  registry.registerPath({
    method: "get",
    path: "/issues/{issueId}/comments",
    summary: "Listar comentarios de issue",
    security: [{ bearerAuth: [] }],
    request: {
      params: issueIdParamSchema,
      query: commentListQuerySchema,
    },
    responses: { 200: { description: "Paginated list: items, total, page, pageSize" } },
  });

  registry.registerPath({
    method: "post",
    path: "/issues/{issueId}/comments",
    summary: "Crear comentario",
    security: [{ bearerAuth: [] }],
    request: {
      params: issueIdParamSchema,
      body: { content: { "application/json": { schema: createCommentSchema } } },
    },
    responses: { 201: { description: "Comentario creado" } },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Issue Tracker API",
      version: "1.0.0",
      description: "API REST para workshop de desarrollo con IA",
    },
    servers: [{ url: "http://localhost:3000" }],
  });

  doc.components = doc.components || {};
  doc.components.securitySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  };

  return doc;
}

module.exports = { getOpenApiSpec };
