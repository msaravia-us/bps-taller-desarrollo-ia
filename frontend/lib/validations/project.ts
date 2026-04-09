import { z } from "zod";

/** Acepta minusculas en el input; el valor validado queda en mayusculas. */
const projectKeySchema = z
  .string()
  .trim()
  .min(2, "Minimo 2 caracteres")
  .max(10, "Maximo 10 caracteres")
  .regex(/^[A-Za-z0-9_]+$/, "Solo letras, numeros y guion bajo")
  .transform((s) => s.toUpperCase());

export const createProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Minimo 2 caracteres")
    .max(100, "Maximo 100 caracteres"),
  key: projectKeySchema,
  description: z.string().max(250, "Maximo 250 caracteres"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

export const editProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Minimo 2 caracteres")
    .max(100, "Maximo 100 caracteres"),
  key: projectKeySchema,
  description: z.string().max(250, "Maximo 250 caracteres"),
});

export type EditProjectFormValues = z.infer<typeof editProjectFormSchema>;
