import { apiRequest } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";

export async function listProjects(token: string): Promise<Project[]> {
  return apiRequest<Project[]>("/projects", {
    method: "GET",
    token,
  });
}
