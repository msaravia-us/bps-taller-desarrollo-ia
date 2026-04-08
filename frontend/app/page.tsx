import { HomeNav } from "@/components/home-nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 font-sans">
      <main className="flex w-full max-w-lg flex-col gap-8 text-center sm:text-left">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Welcome
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Issue tracker
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Sign in to manage your projects and issues in one place.
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <HomeNav />
        </div>

      </main>
    </div>
  );
}
