import { apiRequest } from "@/lib/api/client";
import type { Issue, IssuePriority, IssueStatus, PaginatedResponse } from "@/lib/api/types";

export type ListIssuesParams = {
  projectId: string;
  token: string;
  q?: string;
  status?: IssueStatus | "all";
  priority?: IssuePriority | "all";
  page?: number;
  pageSize?: number;
};

export async function listIssues({
  projectId,
  token,
  q,
  status,
  priority,
  page = 1,
  pageSize = 10,
}: ListIssuesParams): Promise<PaginatedResponse<Issue>> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (status && status !== "all") params.set("status", status);
  if (priority && priority !== "all") params.set("priority", priority);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return apiRequest<PaginatedResponse<Issue>>(
    `/projects/${projectId}/issues?${params.toString()}`,
    {
      method: "GET",
      token,
    },
  );
}
