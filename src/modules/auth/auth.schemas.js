const { z } = require("zod");
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");

extendZodWithOpenApi(z);

const registerSchema = z
  .object({
    email: z.string().email().openapi({ example: "student1@workshop.dev" }),
    displayName: z.string().trim().min(1).max(60).openapi({ example: "Student One" }),
  })
  .openapi("RegisterRequest");

const loginSchema = z
  .object({
    email: z.string().email().openapi({ example: "student1@workshop.dev" }),
  })
  .openapi("LoginRequest");

module.exports = { registerSchema, loginSchema };
