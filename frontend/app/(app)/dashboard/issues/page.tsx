import { IssuesListView } from "@/components/issues/issues-list-view";
import type { IssueStatus } from "@/lib/api/types";

export default async function DashboardIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; q?: string; status?: IssueStatus }>;
}) {
  const { projectId, q, status } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
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
        projectId={projectId}
        initialQuery={q ?? ""}
        initialStatus={status ?? "all"}
      />
    </div>
  );
}
