"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {user?.displayName ?? user?.email}
          </span>
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        You are all set. Start creating and tracking your work from here.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Home
        </Link>
      </div>
    </div>
  );
}
