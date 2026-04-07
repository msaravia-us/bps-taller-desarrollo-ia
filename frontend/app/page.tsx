import { HomeNav } from "@/components/home-nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 font-sans">
      <main className="flex w-full max-w-lg flex-col gap-8 text-center sm:text-left">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Workshop app
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Issue tracker
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Sign in with the Express API (JWT), then use this area for projects
            and issues.
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <HomeNav />
        </div>
        <p className="text-xs text-muted-foreground">
          Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_API_URL</code>{" "}
          in{" "}
          <code className="rounded bg-muted px-1 py-0.5">.env.local</code> (see{" "}
          <code className="rounded bg-muted px-1 py-0.5">.env.example</code>
          ). Run the API on a different port than Next.js (e.g.{" "}
          <code className="rounded bg-muted px-1 py-0.5">PORT=3001</code>).
        </p>
      </main>
    </div>
  );
}
