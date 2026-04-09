"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { IssuesListSkeleton } from "@/components/issues/issues-list-skeleton";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { listAllIssues, updateIssue } from "@/lib/api/issues";
import { listProjects } from "@/lib/api/projects";
import type { Issue, IssuePriority, IssueStatus, PaginatedResponse, Project } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

const STATUS_FILTER_OPTIONS: Array<{ value: IssueStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

const ROW_STATUS_OPTIONS: Array<{ value: IssueStatus; label: string }> = [
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

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm disabled:opacity-50";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseInitialProjectId(value: string | undefined): string | "all" {
  if (value && value.length > 0) return value;
  return "all";
}

export function IssuesListView({
  initialFilterProjectId,
  initialQuery = "",
  initialStatus = "all",
  initialPriority = "all",
}: {
  initialFilterProjectId?: string;
  initialQuery?: string;
  initialStatus?: IssueStatus | "all";
  initialPriority?: IssuePriority | "all";
}) {
  const router = useRouter();
  const { token } = useAuth();

  const initialProject = parseInitialProjectId(initialFilterProjectId);

  const [draftQ, setDraftQ] = useState(initialQuery);
  const [draftStatus, setDraftStatus] = useState<IssueStatus | "all">(initialStatus);
  const [draftPriority, setDraftPriority] = useState<IssuePriority | "all">(initialPriority);
  const [draftProjectId, setDraftProjectId] = useState<string | "all">(initialProject);

  const [applied, setApplied] = useState(() => ({
    q: initialQuery.trim(),
    status: initialStatus,
    priority: initialPriority,
    projectId: initialProject,
  }));

  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<PaginatedResponse<Issue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const skipFullLoadingRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void listProjects(token)
      .then((list) => {
        if (!cancelled) setProjects(list);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setIsLoading(false);
      setData(null);
      return;
    }

    const run = async () => {
      if (!skipFullLoadingRef.current) {
        setIsLoading(true);
      }
      skipFullLoadingRef.current = false;
      setError(null);
      try {
        const response = await listAllIssues({
          token,
          projectId: applied.projectId === "all" ? undefined : applied.projectId,
          q: applied.q || undefined,
          status: applied.status,
          priority: applied.priority,
          page: 1,
          pageSize: 50,
        });
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
  }, [
    token,
    applied.q,
    applied.status,
    applied.priority,
    applied.projectId,
    retryKey,
    dataVersion,
  ]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (draftProjectId !== "all") params.set("projectId", draftProjectId);
    const qTrim = draftQ.trim();
    if (qTrim) params.set("q", qTrim);
    if (draftStatus !== "all") params.set("status", draftStatus);
    if (draftPriority !== "all") params.set("priority", draftPriority);
    const qs = params.toString();
    router.push(qs ? `/dashboard/issues?${qs}` : "/dashboard/issues");
  }

  async function handleStatusChange(issue: Issue, next: IssueStatus) {
    if (next === issue.status || !token) return;
    setStatusError(null);
    setUpdatingIssueId(issue.id);
    try {
      await updateIssue({ issueId: issue.id, token, body: { status: next } });
      skipFullLoadingRef.current = true;
      setDataVersion((v) => v + 1);
    } catch (err) {
      setStatusError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el estado.",
      );
    } finally {
      setUpdatingIssueId(null);
    }
  }

  const appliedLabel =
    applied.projectId === "all"
      ? " de todos tus proyectos."
      : " del proyecto seleccionado.";

  if (isLoading) {
    return <IssuesListSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>
          Busca, filtra y revisa el estado de los issues
          {appliedLabel}
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <Link
            href="/dashboard/issues/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Nuevo issue
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
          <select
            value={draftProjectId}
            onChange={(event) =>
              setDraftProjectId(
                event.target.value === "all" ? "all" : event.target.value,
              )
            }
            className={cn(selectClass, "min-w-[10rem] md:max-w-[14rem]")}
            aria-label="Filtrar por proyecto"
          >
            <option value="all">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.key} — {p.name}
              </option>
            ))}
          </select>
          <Input
            className="min-w-0 flex-1 md:min-w-[12rem]"
            value={draftQ}
            onChange={(event) => setDraftQ(event.target.value)}
            placeholder="Buscar por titulo o descripcion"
            aria-label="Buscar issues"
          />
          <select
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value as IssueStatus | "all")}
            className={selectClass}
            aria-label="Filtrar por estado"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={draftPriority}
            onChange={(event) =>
              setDraftPriority(event.target.value as IssuePriority | "all")
            }
            className={selectClass}
            aria-label="Filtrar por prioridad"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

        {statusError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {statusError}
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
                      {issue.project
                        ? `${issue.project.key} - ${issue.project.name}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <select
                          value={issue.status}
                          disabled={updatingIssueId === issue.id}
                          onChange={(event) =>
                            handleStatusChange(issue, event.target.value as IssueStatus)
                          }
                          className={cn(selectClass, "min-w-[9.5rem]")}
                          aria-label={`Estado de ${issue.title}`}
                        >
                          {ROW_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingIssueId === issue.id ? (
                          <Spinner className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                      </div>
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
