import { IssueDetailView } from "@/components/issues/issue-detail-view";

export default async function DashboardIssueDetailPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;

  return <IssueDetailView issueId={issueId} />;
}
