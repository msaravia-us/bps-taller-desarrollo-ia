const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const issueSchema = z
  .object({
    title: z.string().trim().min(3).max(120).openapi({ example: "Implementar endpoint X" }),
    description: z.string().trim().max(1000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeId: z.string().optional().nullable(),
    labelIds: z.array(z.string()).optional(),
  })
  .openapi("CreateIssueRequest");

const updateIssueSchema = issueSchema.partial().openapi("UpdateIssueRequest");

const issueQuerySchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeId: z.string().optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .openapi("IssueQuery");

const createLabelSchema = z
  .object({
    name: z.string().min(1).max(30).openapi({ example: "backend" }),
    color: z.string().max(10).optional().openapi({ example: "#3b82f6" }),
  })
  .openapi("CreateLabelRequest");

function toIssueResponse(issue) {
  return issue;
}

function toIssueListResponse(payload) {
  return payload;
}

function toLabelResponse(label) {
  return label;
}

module.exports = {
  issueSchema,
  updateIssueSchema,
  issueQuerySchema,
  createLabelSchema,
  toIssueResponse,
  toIssueListResponse,
  toLabelResponse,
};
