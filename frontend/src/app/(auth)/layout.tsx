import type { ReactNode } from "react"
import Link from "next/link"
import { FolderKanbanIcon } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <FolderKanbanIcon />
        Issue Tracker
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
