"use client";

import Link from "next/link";
import { ArrowRightIcon, FolderKanbanIcon, HouseIcon, ListTodoIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const userLabel = user?.displayName ?? user?.email ?? "tu cuenta";

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard</CardTitle>
          <CardDescription>
            Bienvenido,{" "}
            <span className="font-medium text-foreground">{userLabel}</span>. Desde aca
            podes gestionar proyectos y seguir el avance de tus tareas.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">Sesion activa</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Flujo</p>
            <p className="mt-1 font-medium">Organiza</p>
            <p className="text-xs text-muted-foreground">Crea y ordena tus proyectos.</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Seguimiento
            </p>
            <p className="mt-1 font-medium">Prioriza</p>
            <p className="text-xs text-muted-foreground">
              Controla pendientes, progreso y cierres.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Colaboracion
            </p>
            <p className="mt-1 font-medium">Comparte</p>
            <p className="text-xs text-muted-foreground">
              Mantene a tu equipo al dia con contexto claro.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: "default" }))}>
            <FolderKanbanIcon data-icon="inline-start" />
            Ver proyectos
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link href="/dashboard/issues" className={cn(buttonVariants({ variant: "outline" }))}>
            <ListTodoIcon data-icon="inline-start" />
            Ver issues
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
            <HouseIcon data-icon="inline-start" />
            Ir al inicio
          </Link>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Primeros pasos</CardTitle>
            <CardDescription>Ruta recomendada para arrancar mas rapido.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>1. Crea un proyecto con una clave facil de recordar.</p>
            <p>2. Registra issues con prioridad y estado inicial.</p>
            <p>3. Revisa la bandeja de issues para dar seguimiento diario.</p>
          </CardContent>
          <CardFooter>
            <Link
              href="/dashboard/projects/new"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Crear primer proyecto
            </Link>
          </CardFooter>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Accesos rapidos</CardTitle>
            <CardDescription>Navegacion directa a las vistas mas usadas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/dashboard/projects"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full justify-start",
              )}
            >
              Proyectos
            </Link>
            <Link
              href="/dashboard/issues"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full justify-start",
              )}
            >
              Issues
            </Link>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Tip: usa filtros en issues para enfocarte en lo importante.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
