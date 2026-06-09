"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Home,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Proyectos",
    description: "Organiza iniciativas, responsables y alcance.",
    href: "/dashboard/projects",
    icon: FolderKanban,
    cta: "Ver proyectos",
  },
  {
    title: "Issues",
    description: "Prioriza tareas y actualiza estados de seguimiento.",
    href: "/dashboard/issues",
    icon: ClipboardList,
    cta: "Revisar issues",
  },
];

const workflowTips = [
  "Crea un proyecto para agrupar el trabajo importante.",
  "Registra issues con prioridad y estado claro.",
  "Vuelve al dashboard para decidir tu siguiente paso.",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "tu cuenta";

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background">
        <div className="pointer-events-none absolute right-6 top-6 size-24 rounded-full bg-primary/10 blur-2xl" />
        <CardHeader className="relative gap-3">
          <Badge className="w-fit" variant="default">
            <Sparkles aria-hidden="true" className="size-3" />
            Espacio de trabajo
          </Badge>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-3xl tracking-tight">
              Hola, {displayName}
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Tenes todo listo para planificar, priorizar y seguir el avance de
              tus proyectos desde un solo lugar.
            </CardDescription>
          </div>
          <CardAction className="hidden sm:block">
            <Link
              href="/dashboard/issues/new"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Nuevo issue
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/projects/new"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Nuevo proyecto
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/issues"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Ver issues
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
              <Home data-icon="inline-start" aria-hidden="true" />
              Home
            </Link>
          </div>
          <Separator />
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {workflowTips.map((tip) => (
              <div key={tip} className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 text-primary" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card key={action.href} className="transition-colors hover:bg-muted/40">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon aria-hidden="true" className="size-5" />
              </div>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={action.href}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {action.cta}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
