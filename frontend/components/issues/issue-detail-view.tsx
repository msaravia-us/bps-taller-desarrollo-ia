"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { getIssue, updateIssue } from "@/lib/api/issues";
import { getProject } from "@/lib/api/projects";
import type { Issue, ProjectDetail } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { type EditIssueFormValues, editIssueFormSchema } from "@/lib/validations/issue";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
);

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
);

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function issueToFormValues(issue: Issue): EditIssueFormValues {
  return {
    title: issue.title,
    description: issue.description ?? "",
    status: issue.status,
    priority: issue.priority,
    assigneeId: issue.assigneeId ?? "",
  };
}

export function IssueDetailView({ issueId }: { issueId: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);

  const form = useForm<EditIssueFormValues>({
    resolver: zodResolver(editIssueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: "",
    },
  });

  const applyIssueToForm = useCallback(
    (next: Issue) => {
      form.reset(issueToFormValues(next));
    },
    [form],
  );

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIssue(null);
      setProject(null);
      setLoadError(null);
      setProjectError(null);
      setNotFound(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setProjectError(null);
    setNotFound(false);

    void (async () => {
      try {
        const loaded = await getIssue({ issueId, token });
        if (cancelled) return;
        setIssue(loaded);
        applyIssueToForm(loaded);
        try {
          const proj = await getProject(token, loaded.projectId);
          if (!cancelled) {
            setProject(proj);
            setProjectError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setProject(null);
            setProjectError(
              err instanceof ApiError
                ? err.message
                : "No se pudo cargar el proyecto.",
            );
          }
        }
      } catch (err) {
        if (cancelled) return;
        setIssue(null);
        setProject(null);
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el issue.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, issueId, loadVersion, applyIssueToForm]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token) return;
    try {
      const descriptionTrim = data.description.trim();
      await updateIssue({
        issueId,
        token,
        body: {
          title: data.title.trim(),
          ...(descriptionTrim.length > 0 ? { description: descriptionTrim } : { description: "" }),
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId === "" ? null : data.assigneeId,
        },
      });
      const refreshed = await getIssue({ issueId, token });
      setIssue(refreshed);
      applyIssueToForm(refreshed);
      form.clearErrors();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo guardar el issue.";
      form.setError("root", { message });
    }
  });

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Issue</CardTitle>
          <CardDescription>
            Inicia sesión para ver y editar este issue.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard/issues" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al listado
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-5" />
        Cargando issue…
      </div>
    );
  }

  if (notFound) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Issue no encontrado</CardTitle>
          <CardDescription>
            No existe o no tenes acceso a este issue.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard/issues" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al listado
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (loadError || !issue) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No se pudo cargar</CardTitle>
          <CardDescription>{loadError ?? "Error desconocido."}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setLoadVersion((v) => v + 1)}>
            Reintentar
          </Button>
          <Link href="/dashboard/issues" className={cn(buttonVariants({ variant: "ghost" }))}>
            Volver al listado
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Editar issue</h1>
        <p className="text-sm text-muted-foreground">
          Actualizado {formatDateTime(issue.updatedAt)}
          {project ? (
            <>
              {" · "}
              Proyecto:{" "}
              <span className="text-foreground">
                {project.key} — {project.name}
              </span>
            </>
          ) : null}
        </p>
      </div>

      {projectError ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {projectError} (la asignacion puede estar limitada hasta que cargue el proyecto).
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>
            Creado {formatDateTime(issue.createdAt)} · ID {issue.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="contents">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.title}>
                <FieldLabel htmlFor="edit-issue-title">Titulo</FieldLabel>
                <Input
                  id="edit-issue-title"
                  type="text"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.title}
                  disabled={form.formState.isSubmitting}
                  {...form.register("title")}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="edit-issue-description">Descripcion</FieldLabel>
                <textarea
                  id="edit-issue-description"
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
                  <FieldLabel htmlFor="edit-issue-status">Estado</FieldLabel>
                  <select
                    id="edit-issue-status"
                    aria-invalid={!!form.formState.errors.status}
                    className={selectClassName}
                    disabled={form.formState.isSubmitting}
                    {...form.register("status")}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                  <FieldError errors={[form.formState.errors.status]} />
                </Field>
                <Field data-invalid={!!form.formState.errors.priority}>
                  <FieldLabel htmlFor="edit-issue-priority">Prioridad</FieldLabel>
                  <select
                    id="edit-issue-priority"
                    aria-invalid={!!form.formState.errors.priority}
                    className={selectClassName}
                    disabled={form.formState.isSubmitting}
                    {...form.register("priority")}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <FieldError errors={[form.formState.errors.priority]} />
                </Field>
              </div>

              <Field data-invalid={!!form.formState.errors.assigneeId}>
                <FieldLabel htmlFor="edit-issue-assignee">Asignado a</FieldLabel>
                <select
                  id="edit-issue-assignee"
                  aria-invalid={!!form.formState.errors.assigneeId}
                  className={selectClassName}
                  disabled={form.formState.isSubmitting}
                  {...form.register("assigneeId")}
                >
                  <option value="">Sin asignar</option>
                  {(project?.members ?? []).map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.displayName ?? m.user.email}
                    </option>
                  ))}
                </select>
                <FieldError errors={[form.formState.errors.assigneeId]} />
              </Field>

              {form.formState.errors.root ? (
                <FieldError>{form.formState.errors.root.message}</FieldError>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" className="size-4" />
                      Guardando…
                    </>
                  ) : (
                    "Guardar cambios"
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
        </CardContent>
      </Card>
    </div>
  );
}
