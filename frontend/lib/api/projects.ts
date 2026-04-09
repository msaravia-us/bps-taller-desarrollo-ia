import { apiRequest } from "@/lib/api/client";
import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  UpdateProjectInput,
} from "@/lib/api/types";

export async function listProjects(token: string): Promise<Project[]> {
  return apiRequest<Project[]>("/projects", {
    method: "GET",
    token,
  });
}

export async function getProject(
  token: string,
  projectId: string,
): Promise<ProjectDetail> {
  return apiRequest<ProjectDetail>(`/projects/${projectId}`, {
    method: "GET",
    token,
  });
}

export async function createProject({
  token,
  body,
}: {
  token: string;
  body: CreateProjectInput;
}): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    token,
    body,
  });
}

export async function updateProject({
  token,
  projectId,
  body,
}: {
  token: string;
  projectId: string;
  body: UpdateProjectInput;
}): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    token,
    body,
  });
}
