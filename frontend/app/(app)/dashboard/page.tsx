"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, FolderKanban, Home, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const identity = user?.displayName ?? user?.email;

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <Sparkles data-icon="inline-start" />
              Bienvenido
            </Badge>
          </div>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Hola{" "}
            <span className="font-medium text-foreground">
              {identity}
            </span>
            . Organiza tu trabajo y entra rápido a tus módulos principales.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2">
              <FolderKanban />
              Proyectos
            </CardTitle>
            <CardDescription>
              Crea, revisa y mantiene la estructura de tus iniciativas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/projects"
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Ir a proyectos
              <ArrowRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList />
              Issues
            </CardTitle>
            <CardDescription>
              Visualiza, prioriza y da seguimiento a incidencias del equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/issues"
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Ir a issues
              <ArrowRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Accesos rápidos</CardTitle>
          <CardDescription>
            También puedes volver al inicio público de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            <Home data-icon="inline-start" />
            Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
