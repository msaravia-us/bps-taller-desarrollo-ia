"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import { createProject } from "@/lib/api/projects";
import type { CreateProjectInput } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type CreateProjectFormValues,
  createProjectFormSchema,
} from "@/lib/validations/project";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
);

export function CreateProjectForm() {
  const router = useRouter();
  const { token } = useAuth();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return;
    try {
      const body: CreateProjectInput = {
        name: data.name.trim(),
        key: data.key,
      };
      const desc = data.description.trim();
      if (desc) body.description = desc;

      const created = await createProject({ token, body });
      form.clearErrors();
      router.push(`/dashboard/projects/${created.id}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo crear el proyecto.";
      form.setError("root", { message });
    }
  });

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nuevo proyecto</CardTitle>
          <CardDescription>Inicia sesion para crear un proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al listado
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nuevo proyecto</CardTitle>
        <CardDescription>
          La clave es un identificador corto en mayusculas (por ejemplo CURS01). La descripcion es
          opcional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="contents">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="project-name">Nombre</FieldLabel>
              <Input
                id="project-name"
                type="text"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.name}
                disabled={form.formState.isSubmitting}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.key}>
              <FieldLabel htmlFor="project-key">Clave</FieldLabel>
              <Input
                id="project-key"
                type="text"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.key}
                disabled={form.formState.isSubmitting}
                className="font-mono uppercase"
                {...form.register("key")}
              />
              <FieldError errors={[form.formState.errors.key]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="project-description">Descripcion (opcional)</FieldLabel>
              <textarea
                id="project-description"
                rows={4}
                aria-invalid={!!form.formState.errors.description}
                className={textareaClassName}
                disabled={form.formState.isSubmitting}
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

            {form.formState.errors.root ? (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" className="size-4" />
                    Creando…
                  </>
                ) : (
                  "Crear proyecto"
                )}
              </Button>
              <Link
                href="/dashboard/projects"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancelar
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
