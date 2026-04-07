import { clearStoredToken } from "@/lib/auth/storage"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }
  return url.replace(/\/$/, "")
}

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  token?: string | null
  body?: unknown
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  const { token, body, headers: initHeaders, ...rest } = init
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`

  const headers = new Headers(initHeaders)
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body:
      body === undefined || body instanceof FormData
        ? (body as BodyInit | undefined)
        : JSON.stringify(body),
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      throw new ApiError(res.status, text || res.statusText)
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken()
    }
    const message =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : res.statusText
    throw new ApiError(res.status, message)
  }

  return json as T
}
