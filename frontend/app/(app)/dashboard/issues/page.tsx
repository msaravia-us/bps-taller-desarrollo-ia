import { IssuesListView } from "@/components/issues/issues-list-view";
import type { IssuePriority, IssueStatus } from "@/lib/api/types";

const PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH"];

function parsePriority(value: string | undefined): IssuePriority | "all" {
  if (value && PRIORITIES.includes(value as IssuePriority)) {
    return value as IssuePriority;
  }
  return "all";
}

export default async function DashboardIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    q?: string;
    status?: string;
    priority?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const projectId = sp.projectId;
  const statusRaw = sp.status;
  const status: IssueStatus | "all" =
    statusRaw === "TODO" || statusRaw === "IN_PROGRESS" || statusRaw === "DONE"
      ? statusRaw
      : "all";
  const priority = parsePriority(sp.priority);

  const listKey = JSON.stringify({
    p: projectId ?? null,
    q: q || null,
    s: status === "all" ? null : status,
    pr: priority === "all" ? null : priority,
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Listado de issues
        </h1>
        <p className="text-muted-foreground">
          {projectId
            ? "Vista de seguimiento para el proyecto activo."
            : "Vista de seguimiento para todos tus proyectos."}
        </p>
      </div>
      <IssuesListView
        key={listKey}
        initialFilterProjectId={projectId}
        initialQuery={q}
        initialStatus={status}
        initialPriority={priority}
      />
    </div>
  );
}
