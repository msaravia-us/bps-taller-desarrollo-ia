import { apiRequest } from "@/lib/api/client";
import type {
  CreateIssueInput,
  Issue,
  IssuePriority,
  IssueStatus,
  PaginatedResponse,
  UpdateIssueInput,
} from "@/lib/api/types";

export type ListIssuesParams = {
  projectId: string;
  token: string;
  q?: string;
  status?: IssueStatus | "all";
  priority?: IssuePriority | "all";
  page?: number;
  pageSize?: number;
};

export type ListAllIssuesParams = {
  token: string;
  /** Si se omite, incluye issues de todos los proyectos del usuario */
  projectId?: string;
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

export async function listAllIssues({
  token,
  projectId,
  q,
  status,
  priority,
  page = 1,
  pageSize = 50,
}: ListAllIssuesParams): Promise<PaginatedResponse<Issue>> {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  if (q?.trim()) params.set("q", q.trim());
  if (status && status !== "all") params.set("status", status);
  if (priority && priority !== "all") params.set("priority", priority);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return apiRequest<PaginatedResponse<Issue>>(`/issues?${params.toString()}`, {
    method: "GET",
    token,
  });
}

export async function createIssue({
  projectId,
  token,
  body,
}: {
  projectId: string;
  token: string;
  body: CreateIssueInput;
}): Promise<Issue> {
  return apiRequest<Issue>(`/projects/${projectId}/issues`, {
    method: "POST",
    token,
    body,
  });
}

export async function getIssue({
  issueId,
  token,
}: {
  issueId: string;
  token: string;
}): Promise<Issue> {
  return apiRequest<Issue>(`/issues/${issueId}`, {
    method: "GET",
    token,
  });
}

export async function updateIssue({
  issueId,
  token,
  body,
}: {
  issueId: string;
  token: string;
  body: UpdateIssueInput;
}): Promise<Issue> {
  return apiRequest<Issue>(`/issues/${issueId}`, {
    method: "PATCH",
    token,
    body,
  });
}
