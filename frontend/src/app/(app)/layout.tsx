import type { ReactNode } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { ProtectedShell } from "@/components/auth/protected-shell"

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedShell>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </ProtectedShell>
  )
}
