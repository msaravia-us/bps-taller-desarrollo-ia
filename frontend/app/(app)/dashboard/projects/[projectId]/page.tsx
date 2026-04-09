import { ProjectDetailView } from "@/components/projects/project-detail-view";

export default async function DashboardProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectDetailView projectId={projectId} />;
}
