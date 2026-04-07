/**
 * Must read NEXT_PUBLIC_* with a static property access so Next.js inlines
 * the value in client bundles. Dynamic `process.env[name]` stays undefined on the client.
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiUrl?.trim()) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Copy frontend/.env.example to frontend/.env.local and set the API URL.",
  );
}

/** Express API origin, no trailing slash (e.g. http://localhost:3001). */
export const apiUrl = rawApiUrl.trim().replace(/\/$/, "");
