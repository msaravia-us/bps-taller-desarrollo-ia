const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const projectSchema = z
  .object({
    name: z.string().trim().min(2).max(100).openapi({ example: "Curso IA - Project" }),
    key: z.string().trim().min(2).max(10).regex(/^[A-Z0-9_]+$/).openapi({ example: "CURSO1" }),
    description: z.string().trim().max(250).optional().openapi({ example: "Proyecto del workshop" }),
  })
  .openapi("CreateProjectRequest");

const updateProjectSchema = projectSchema.partial().openapi("UpdateProjectRequest");

const addProjectMemberSchema = z
  .object({
    email: z.string().email().openapi({ example: "student2@workshop.dev" }),
    role: z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
  })
  .openapi("AddProjectMemberRequest");

function toProjectMemberResponse(member) {
  return {
    id: member.id,
    projectId: member.projectId,
    userId: member.userId,
    role: member.role,
    createdAt: member.createdAt,
    user: member.user,
  };
}

function toProjectMembersResponse(members) {
  return members.map(toProjectMemberResponse);
}

function toProjectResponse(project) {
  return project;
}

function toProjectsResponse(projects) {
  return projects.map(toProjectResponse);
}

module.exports = {
  projectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  toProjectMemberResponse,
  toProjectMembersResponse,
  toProjectResponse,
  toProjectsResponse,
};
