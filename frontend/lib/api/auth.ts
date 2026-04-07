import { apiRequest } from "@/lib/api/client";
import type { AuthPayload, User } from "@/lib/api/types";

export async function register(body: {
  email: string;
  displayName: string;
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/auth/register", {
    method: "POST",
    body,
  });
}

export async function login(body: { email: string }): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/auth/login", {
    method: "POST",
    body,
  });
}

export async function me(token: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>("/auth/me", {
    method: "GET",
    token,
  });
}
