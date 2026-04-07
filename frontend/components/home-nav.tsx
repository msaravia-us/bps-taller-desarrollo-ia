"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

export function HomeNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "min-w-[10rem]")}
      >
        Go to dashboard
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/register"
        className={cn(
          buttonVariants({ size: "lg" }),
          "min-w-[10rem] justify-center",
        )}
      >
        Register
      </Link>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "min-w-[10rem] justify-center",
        )}
      >
        Sign in
      </Link>
    </div>
  );
}
