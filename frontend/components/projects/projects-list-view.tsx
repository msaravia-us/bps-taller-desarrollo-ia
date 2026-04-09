"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ProjectsListSkeleton } from "@/components/projects/projects-list-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { listProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncate(text: string | null, max: number) {
  if (!text) return "—";
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function ProjectsListView({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const { token } = useAuth();

  const [draftQ, setDraftQ] = useState(initialQuery);
  const [appliedQ, setAppliedQ] = useState(initialQuery.trim());

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setIsLoading(false);
      setProjects([]);
      return;
    }

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const list = await listProjects(token);
        if (!cancelled) setProjects(list);
      } catch (err) {
        if (!cancelled) {
          setProjects([]);
          setError(
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el listado de proyectos.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, retryKey]);

  const filtered = useMemo(() => {
    const q = appliedQ.toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false),
    );
  }, [projects, appliedQ]);

  function applyFilters() {
    const qTrim = draftQ.trim();
    const params = new URLSearchParams();
    if (qTrim) params.set("q", qTrim);
    const qs = params.toString();
    router.push(qs ? `/dashboard/projects?${qs}` : "/dashboard/projects");
    setAppliedQ(qTrim);
  }

  if (isLoading) {
    return <ProjectsListSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos</CardTitle>
        <CardDescription>
          Busca por nombre, clave o descripcion. Los datos se filtran en el cliente.
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <Link
            href="/dashboard/projects/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Nuevo proyecto
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input
            className="min-w-0 flex-1 sm:min-w-[12rem]"
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="Buscar por nombre, clave o descripcion"
            aria-label="Buscar proyectos"
          />
          <Button type="button" onClick={applyFilters} className="shrink-0">
            Aplicar
          </Button>
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setRetryKey((k) => k + 1)}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {!error && filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {projects.length === 0
              ? "No tenes proyectos todavia. Crea uno con el boton de arriba."
              : "No hay proyectos que coincidan con la busqueda."}
          </div>
        ) : null}

        {!error && filtered.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Clave</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="text-right">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="font-mono text-sm">{project.key}</TableCell>
                    <TableCell className="max-w-[14rem] text-muted-foreground">
                      {truncate(project.description, 80)}
                    </TableCell>
                    <TableCell>{formatDate(project.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">
              Mostrando {filtered.length}
              {appliedQ ? ` de ${projects.length} proyectos` : ` proyecto${filtered.length === 1 ? "" : "s"}`}.
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
