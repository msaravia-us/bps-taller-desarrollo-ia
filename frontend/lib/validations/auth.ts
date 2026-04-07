import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(60, "At most 60 characters"),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
