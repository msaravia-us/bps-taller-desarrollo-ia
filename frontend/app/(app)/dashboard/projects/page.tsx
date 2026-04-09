import { ProjectsListView } from "@/components/projects/projects-list-view";

export default async function DashboardProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const listKey = JSON.stringify({ q: q || null });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Listado de proyectos
        </h1>
        <p className="text-muted-foreground">
          Gestion de proyectos: crear, ver y editar (edicion solo si sos dueno).
        </p>
      </div>
      <ProjectsListView key={listKey} initialQuery={q} />
    </div>
  );
}
