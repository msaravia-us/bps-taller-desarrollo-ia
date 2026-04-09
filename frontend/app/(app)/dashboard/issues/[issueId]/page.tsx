import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardIssueDetailPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Issue {issueId}
      </h1>
      <p className="text-sm text-muted-foreground">
        Vista de detalle pendiente de implementacion.
      </p>
      <Link href="/dashboard/issues" className={cn(buttonVariants({ variant: "outline" }))}>
        Volver al listado
      </Link>
    </div>
  );
}
