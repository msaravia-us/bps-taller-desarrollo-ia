import { z } from "zod";

export const createIssueFormSchema = z.object({
  projectId: z.string().min(1, "Selecciona un proyecto"),
  title: z
    .string()
    .trim()
    .min(3, "Minimo 3 caracteres")
    .max(120, "Maximo 120 caracteres"),
  description: z.string().max(1000, "Maximo 1000 caracteres"),
  status: z.enum(["", "TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["", "LOW", "MEDIUM", "HIGH"]),
});

export type CreateIssueFormValues = z.infer<typeof createIssueFormSchema>;

export const editIssueFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Minimo 3 caracteres")
    .max(120, "Maximo 120 caracteres"),
  description: z.string().max(1000, "Maximo 1000 caracteres"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.union([z.literal(""), z.string().min(1)]),
});

export type EditIssueFormValues = z.infer<typeof editIssueFormSchema>;
