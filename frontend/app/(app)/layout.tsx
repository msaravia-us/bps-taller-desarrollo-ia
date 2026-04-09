"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/auth-provider";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
