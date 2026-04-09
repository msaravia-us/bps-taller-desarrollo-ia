import { apiRequest } from "@/lib/api/client";
import type { Project, ProjectDetail } from "@/lib/api/types";

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
