"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [ready, token, router, pathname])

  if (!ready || !token) {
    return (
      <div className="flex min-h-[40vh] flex-col gap-3 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full max-w-xl" />
      </div>
    )
  }

  return <>{children}</>
}
