const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const createCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(1000).openapi({ example: "This issue is now in progress." }),
  })
  .openapi("CreateCommentRequest");

const updateCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(1000).openapi({ example: "Updated comment text." }),
  })
  .openapi("UpdateCommentRequest");

const commentListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .openapi("CommentListQuery");

function toCommentResponse(comment) {
  return comment;
}

function toCommentListResponse(payload) {
  return payload;
}

module.exports = {
  createCommentSchema,
  updateCommentSchema,
  commentListQuerySchema,
  toCommentResponse,
  toCommentListResponse,
};
