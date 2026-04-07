import { Suspense } from "react"
import { ProjectIssuesView } from "./project-issues-view"
import { Skeleton } from "@/components/ui/skeleton"

function IssuesFallback() {
  return (
    <div className="flex flex-col gap-2 p-1">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export default function ProjectIssuesPage() {
  return (
    <Suspense fallback={<IssuesFallback />}>
      <ProjectIssuesView />
    </Suspense>
  )
}
