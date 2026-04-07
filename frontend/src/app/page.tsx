"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const { token, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    router.replace(token ? "/projects" : "/login")
  }, [ready, token, router])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <Skeleton className="h-8 w-40" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}
