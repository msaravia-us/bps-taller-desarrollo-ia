const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const createCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(1000).openapi({ example: "Este issue ya está en progreso." }),
  })
  .openapi("CreateCommentRequest");

module.exports = { createCommentSchema };
