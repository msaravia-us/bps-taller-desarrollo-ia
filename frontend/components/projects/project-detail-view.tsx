"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getProject, updateProject } from "@/lib/api/projects";
import type { ProjectDetail } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type EditProjectFormValues,
  editProjectFormSchema,
} from "@/lib/validations/project";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
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

function projectToFormValues(project: ProjectDetail): EditProjectFormValues {
  return {
    name: project.name,
    key: project.key,
    description: project.description ?? "",
  };
}

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const applyProjectToForm = useCallback(
    (next: ProjectDetail) => {
      form.reset(projectToFormValues(next));
    },
    [form],
  );

  const isOwner = useMemo(() => {
    if (!user || !project) return false;
    return project.members.some(
      (m) => m.userId === user.id && m.role === "OWNER",
    );
  }, [user, project]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setProject(null);
      setLoadError(null);
      setNotFound(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);

    void (async () => {
      try {
        const loaded = await getProject(token, projectId);
        if (cancelled) return;
        setProject(loaded);
        applyProjectToForm(loaded);
      } catch (err) {
        if (cancelled) return;
        setProject(null);
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el proyecto.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, projectId, loadVersion, applyProjectToForm]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token || !isOwner) return;
    try {
      const descTrim = data.description.trim();
      await updateProject({
        projectId,
        token,
        body: {
          name: data.name.trim(),
          key: data.key,
          ...(descTrim.length > 0 ? { description: descTrim } : { description: "" }),
        },
      });
      const refreshed = await getProject(token, projectId);
      setProject(refreshed);
      applyProjectToForm(refreshed);
      form.clearErrors();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 403
            ? "Solo el dueno del proyecto puede editarlo."
            : err.message
          : "No se pudo guardar el proyecto.";
      form.setError("root", { message });
    }
  });

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Proyecto</CardTitle>
          <CardDescription>
            Inicia sesion para ver y editar este proyecto.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: "outline" }))}>
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
        Cargando proyecto…
      </div>
    );
  }

  if (notFound) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Proyecto no encontrado</CardTitle>
          <CardDescription>
            No existe o no tenes acceso a este proyecto.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al listado
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (loadError || !project) {
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
          <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: "ghost" }))}>
            Volver al listado
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isOwner ? "Editar proyecto" : "Proyecto"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualizado {formatDateTime(project.updatedAt)}
          {!isOwner ? (
            <span className="text-muted-foreground"> · Solo lectura (no sos dueno)</span>
          ) : null}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>
            Creado {formatDateTime(project.createdAt)} · ID {project.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isOwner ? (
            <form onSubmit={onSubmit} className="contents">
              <FieldGroup>
                <Field data-invalid={!!form.formState.errors.name}>
                  <FieldLabel htmlFor="edit-project-name">Nombre</FieldLabel>
                  <Input
                    id="edit-project-name"
                    type="text"
                    autoComplete="off"
                    aria-invalid={!!form.formState.errors.name}
                    disabled={form.formState.isSubmitting}
                    {...form.register("name")}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.key}>
                  <FieldLabel htmlFor="edit-project-key">Clave</FieldLabel>
                  <Input
                    id="edit-project-key"
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
                  <FieldLabel htmlFor="edit-project-description">Descripcion</FieldLabel>
                  <textarea
                    id="edit-project-description"
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
                        Guardando…
                      </>
                    ) : (
                      "Guardar cambios"
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
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Nombre:</span> {project.name}
              </p>
              <p>
                <span className="font-medium text-foreground">Clave:</span>{" "}
                <span className="font-mono">{project.key}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Descripcion:</span>{" "}
                {project.description?.trim() ? project.description : "—"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Miembros</CardTitle>
          <CardDescription>Integrantes con acceso al proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          {project.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin miembros listados.</p>
          ) : (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {project.members.map((m) => (
                <li key={m.userId}>
                  {m.user.displayName ?? m.user.email}
                  <span className="text-muted-foreground"> ({m.role})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiquetas</CardTitle>
          <CardDescription>Labels definidos en el proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          {project.labels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay etiquetas.</p>
          ) : (
            <ul className="flex flex-wrap gap-2 text-sm">
              {project.labels.map((label) => (
                <li
                  key={label.id}
                  className="rounded-md border border-border bg-muted/40 px-2 py-1"
                >
                  {label.name}
                  {label.color ? (
                    <span className="text-muted-foreground"> · {label.color}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
