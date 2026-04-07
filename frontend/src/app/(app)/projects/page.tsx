"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api/client"
import type { Project } from "@/lib/api/types"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  key: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[A-Z0-9_]+$/, "Use uppercase letters, digits, or underscore"),
  description: z.string().trim().max(250).optional(),
})

type CreateProjectValues = z.infer<typeof createProjectSchema>

export default function ProjectsPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await apiFetch<Project[]>("/projects", { token })
      setProjects(list)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load projects")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", key: "", description: "" },
  })

  async function onCreate(values: CreateProjectValues) {
    if (!token) return
    try {
      await apiFetch<Project>("/projects", {
        method: "POST",
        token,
        body: {
          name: values.name.trim(),
          key: values.key.trim(),
          description: values.description?.trim() || undefined,
        },
      })
      toast.success("Project created")
      setOpen(false)
      form.reset()
      load()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not create project")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Select a project to manage issues.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button type="button" onClick={() => setOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            New project
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>
                A short key is used as an issue prefix in many trackers.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              className="flex flex-col gap-4"
            >
              <FieldGroup>
                <Field data-invalid={!!form.formState.errors.name}>
                  <FieldLabel htmlFor="p-name">Name</FieldLabel>
                  <Input
                    id="p-name"
                    aria-invalid={!!form.formState.errors.name}
                    {...form.register("name")}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>
                <Field data-invalid={!!form.formState.errors.key}>
                  <FieldLabel htmlFor="p-key">Key</FieldLabel>
                  <Input
                    id="p-key"
                    placeholder="PROJ1"
                    aria-invalid={!!form.formState.errors.key}
                    {...form.register("key")}
                  />
                  <FieldError errors={[form.formState.errors.key]} />
                </Field>
                <Field data-invalid={!!form.formState.errors.description}>
                  <FieldLabel htmlFor="p-desc">Description (optional)</FieldLabel>
                  <Textarea
                    id="p-desc"
                    aria-invalid={!!form.formState.errors.description}
                    {...form.register("description")}
                  />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {!loading && projects && projects.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first project to start tracking issues.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && projects && projects.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="flex items-baseline gap-2">
                      <span>{p.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {p.key}
                      </span>
                    </CardTitle>
                    {p.description && (
                      <CardDescription className="line-clamp-2">
                        {p.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    View project
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
