"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { createIssue } from "@/lib/api/issues";
import { listProjects } from "@/lib/api/projects";
import type { CreateIssueInput, IssuePriority, IssueStatus, Project } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type CreateIssueFormValues,
  createIssueFormSchema,
} from "@/lib/validations/issue";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
);

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
);

export function CreateIssueForm() {
  const router = useRouter();
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const form = useForm<CreateIssueFormValues>({
    resolver: zodResolver(createIssueFormSchema),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      status: "",
      priority: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setProjectsLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const list = await listProjects(token);
        if (!cancelled) setProjects(list);
      } catch (err) {
        if (!cancelled) {
          setProjectsError(
            err instanceof ApiError
              ? err.message
              : "No se pudieron cargar los proyectos.",
          );
        }
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return;
    try {
      const body: CreateIssueInput = { title: data.title.trim() };
      const desc = data.description.trim();
      if (desc) body.description = desc;
      if (data.status) body.status = data.status as IssueStatus;
      if (data.priority) body.priority = data.priority as IssuePriority;

      await createIssue({
        projectId: data.projectId,
        token,
        body,
      });
      form.clearErrors();
      router.push("/dashboard/issues");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo crear el issue.";
      form.setError("root", { message });
    }
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Nuevo issue</CardTitle>
        <CardDescription>
          Completa los datos. El estado y la prioridad son opcionales; si los dejas
          vacios, el servidor usara valores por defecto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projectsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            Cargando proyectos…
          </div>
        ) : null}
        {projectsError ? (
          <FieldError className="mb-4">{projectsError}</FieldError>
        ) : null}

        {!projectsLoading && !projectsError && projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay proyectos. Crea un proyecto en el backend o asigna acceso antes de
            abrir issues.
          </p>
        ) : null}

        {projects.length > 0 ? (
          <form onSubmit={onSubmit} className="contents">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.projectId}>
                <FieldLabel htmlFor="issue-project">Proyecto</FieldLabel>
                <select
                  id="issue-project"
                  aria-invalid={!!form.formState.errors.projectId}
                  className={selectClassName}
                  disabled={form.formState.isSubmitting}
                  {...form.register("projectId")}
                >
                  <option value="">Selecciona un proyecto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.key} — {p.name}
                    </option>
                  ))}
                </select>
                <FieldError errors={[form.formState.errors.projectId]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.title}>
                <FieldLabel htmlFor="issue-title">Titulo</FieldLabel>
                <Input
                  id="issue-title"
                  type="text"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.title}
                  disabled={form.formState.isSubmitting}
                  {...form.register("title")}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="issue-description">Descripcion (opcional)</FieldLabel>
                <textarea
                  id="issue-description"
                  rows={4}
                  aria-invalid={!!form.formState.errors.description}
                  className={textareaClassName}
                  disabled={form.formState.isSubmitting}
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!form.formState.errors.status}>
                  <FieldLabel htmlFor="issue-status">Estado (opcional)</FieldLabel>
                  <select
                    id="issue-status"
                    aria-invalid={!!form.formState.errors.status}
                    className={selectClassName}
                    disabled={form.formState.isSubmitting}
                    {...form.register("status")}
                  >
                    <option value="">Predeterminado (To do)</option>
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                  <FieldError errors={[form.formState.errors.status]} />
                </Field>
                <Field data-invalid={!!form.formState.errors.priority}>
                  <FieldLabel htmlFor="issue-priority">Prioridad (opcional)</FieldLabel>
                  <select
                    id="issue-priority"
                    aria-invalid={!!form.formState.errors.priority}
                    className={selectClassName}
                    disabled={form.formState.isSubmitting}
                    {...form.register("priority")}
                  >
                    <option value="">Predeterminado (Medium)</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <FieldError errors={[form.formState.errors.priority]} />
                </Field>
              </div>

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
                    "Crear issue"
                  )}
                </Button>
                <Link
                  href="/dashboard/issues"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancelar
                </Link>
              </div>
            </FieldGroup>
          </form>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/issues"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Volver al listado
        </Link>
      </CardFooter>
    </Card>
  );
}
