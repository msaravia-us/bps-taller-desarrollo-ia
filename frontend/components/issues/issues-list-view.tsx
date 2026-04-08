"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { IssuesListSkeleton } from "@/components/issues/issues-list-skeleton";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiError } from "@/lib/api/client";
import { listIssues } from "@/lib/api/issues";
import { listProjects } from "@/lib/api/projects";
import type {
  Issue,
  IssuePriority,
  IssueStatus,
  PaginatedResponse,
  Project,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: IssueStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS: Array<{ value: IssuePriority | "all"; label: string }> = [
  { value: "all", label: "Cualquier prioridad" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

function formatStatus(status: IssueStatus) {
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "DONE") return "Done";
  return "To do";
}

function statusVariant(status: IssueStatus) {
  if (status === "DONE") return "success" as const;
  if (status === "IN_PROGRESS") return "warning" as const;
  return "outline" as const;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function IssuesListView({
  projectId,
  initialQuery = "",
  initialStatus = "all",
}: {
  projectId?: string;
  initialQuery?: string;
  initialStatus?: IssueStatus | "all";
}) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<IssueStatus | "all">(initialStatus);
  const [priority, setPriority] = useState<IssuePriority | "all">("all");
  const [data, setData] = useState<PaginatedResponse<(Issue & { project?: Project })> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFilters = useMemo(
    () => ({
      q: query.trim(),
      status,
      priority,
    }),
    [query, status, priority],
  );

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setIsLoading(false);
      setData(null);
      return;
    }

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = projectId
          ? await listIssues({
              projectId,
              token,
              q: activeFilters.q || undefined,
              status: activeFilters.status,
              priority: activeFilters.priority,
              page: 1,
              pageSize: 10,
            })
          : await (async () => {
              const projects = await listProjects(token);
              const responses = await Promise.all(
                projects.map(async (project) => {
                  const issues = await listIssues({
                    projectId: project.id,
                    token,
                    q: activeFilters.q || undefined,
                    status: activeFilters.status,
                    priority: activeFilters.priority,
                    page: 1,
                    pageSize: 50,
                  });
                  return issues.items.map((issue) => ({ ...issue, project }));
                }),
              );
              const items = responses
                .flat()
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                );

              return {
                items,
                total: items.length,
                page: 1,
                pageSize: items.length || 1,
              };
            })();
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el listado de issues.";
          setError(message);
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [projectId, token, activeFilters]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (projectId) {
      params.set("projectId", projectId);
    }
    if (query.trim()) params.set("q", query.trim());
    if (status !== "all") params.set("status", status);
    router.push(`/dashboard/issues?${params.toString()}`);
  }

  if (isLoading) {
    return <IssuesListSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>
          Busca, filtra y revisa el estado de los issues
          {projectId ? " del proyecto." : " de todos tus proyectos."}
        </CardDescription>
        <CardAction>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Volver al dashboard
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por titulo o descripcion"
            aria-label="Buscar issues"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as IssueStatus | "all")}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            aria-label="Filtrar por estado"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as IssuePriority | "all")
            }
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            aria-label="Filtrar por prioridad"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button onClick={applyFilters}>Aplicar</Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!error && (!data || data.items.length === 0) ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No hay issues para los filtros seleccionados.
          </div>
        ) : null}

        {!error && data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead className="text-right">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.title}</TableCell>
                    <TableCell>
                      {issue.project ? `${issue.project.key} - ${issue.project.name}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(issue.status)}>
                        {formatStatus(issue.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{issue.priority}</TableCell>
                    <TableCell>{formatDate(issue.updatedAt)}</TableCell>
                    <TableCell>
                      {issue.assignee?.displayName ?? issue.assignee?.email ?? "Sin asignar"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/issues/${issue.id}`}
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
              Mostrando {data.items.length} de {data.total} issues.
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
