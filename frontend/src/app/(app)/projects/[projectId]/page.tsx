"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowRightIcon, UserPlusIcon } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api/client"
import type { Project } from "@/lib/api/types"
import { useAuth } from "@/contexts/auth-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  key: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[A-Z0-9_]+$/, "Use uppercase letters, digits, or underscore")
    .optional(),
  description: z.string().trim().max(250).optional(),
})

const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "MEMBER"]),
})

type UpdateValues = z.infer<typeof updateSchema>
type MemberValues = z.infer<typeof memberSchema>

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId
  const { token, user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)

  const load = useCallback(async () => {
    if (!token || !projectId) return
    setLoading(true)
    try {
      const p = await apiFetch<Project>(`/projects/${projectId}`, { token })
      setProject(p)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load project")
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    load()
  }, [load])

  const myRole = useMemo(() => {
    if (!project?.members || !user) return undefined
    const m = project.members.find((x) => x.userId === user.id)
    return m?.role
  }, [project, user])

  const isOwner = myRole === "OWNER"

  const editForm = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  })

  useEffect(() => {
    if (!project) return
    editForm.reset({
      name: project.name,
      key: project.key,
      description: project.description ?? "",
    })
  }, [project, editForm])

  const memberForm = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: "", role: "MEMBER" },
  })

  async function onUpdate(values: UpdateValues) {
    if (!token || !projectId) return
    try {
      const body: Record<string, string> = {}
      if (values.name?.trim()) body.name = values.name.trim()
      if (values.key?.trim()) body.key = values.key.trim()
      if (values.description !== undefined) {
        body.description = values.description.trim()
      }
      const updated = await apiFetch<Project>(`/projects/${projectId}`, {
        method: "PATCH",
        token,
        body,
      })
      setProject(updated)
      toast.success("Project updated")
      setEditOpen(false)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not update")
    }
  }

  async function onAddMember(values: MemberValues) {
    if (!token || !projectId) return
    try {
      await apiFetch(`/projects/${projectId}/members`, {
        method: "POST",
        token,
        body: { email: values.email.trim().toLowerCase(), role: values.role },
      })
      toast.success("Member added")
      setMemberOpen(false)
      memberForm.reset({ email: "", role: "MEMBER" })
      load()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not add member")
    }
  }

  async function onDeleteProject() {
    if (!token || !projectId) return
    if (!confirm("Delete this project and all its issues?")) return
    try {
      await apiFetch(`/projects/${projectId}`, { method: "DELETE", token })
      toast.success("Project deleted")
      router.replace("/projects")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not delete")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-48 w-full max-w-2xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Project not found</AlertTitle>
        <AlertDescription>
          <Link
            href="/projects"
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
          >
            Back to projects
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <span className="px-1">/</span>
            <span>{project.key}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${project.id}/issues`}
            className={cn(buttonVariants(), "inline-flex")}
          >
            Issues
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          {isOwner && (
            <>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit project</DialogTitle>
                    <DialogDescription>
                      Only owners can change project settings.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={editForm.handleSubmit(onUpdate)}
                    className="flex flex-col gap-4"
                  >
                    <FieldGroup>
                      <Field data-invalid={!!editForm.formState.errors.name}>
                        <FieldLabel htmlFor="e-name">Name</FieldLabel>
                        <Input
                          id="e-name"
                          aria-invalid={!!editForm.formState.errors.name}
                          {...editForm.register("name")}
                        />
                        <FieldError errors={[editForm.formState.errors.name]} />
                      </Field>
                      <Field data-invalid={!!editForm.formState.errors.key}>
                        <FieldLabel htmlFor="e-key">Key</FieldLabel>
                        <Input
                          id="e-key"
                          aria-invalid={!!editForm.formState.errors.key}
                          {...editForm.register("key")}
                        />
                        <FieldError errors={[editForm.formState.errors.key]} />
                      </Field>
                      <Field
                        data-invalid={!!editForm.formState.errors.description}
                      >
                        <FieldLabel htmlFor="e-desc">Description</FieldLabel>
                        <Textarea
                          id="e-desc"
                          aria-invalid={
                            !!editForm.formState.errors.description
                          }
                          {...editForm.register("description")}
                        />
                        <FieldError
                          errors={[editForm.formState.errors.description]}
                        />
                      </Field>
                    </FieldGroup>
                    <Button
                      type="submit"
                      disabled={editForm.formState.isSubmitting}
                    >
                      {editForm.formState.isSubmitting ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Saving…
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMemberOpen(true)}
                >
                  <UserPlusIcon data-icon="inline-start" />
                  Add member
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add member</DialogTitle>
                    <DialogDescription>
                      If the email is new, a user stub is created without a display name.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={memberForm.handleSubmit(onAddMember)}
                    className="flex flex-col gap-4"
                  >
                    <FieldGroup>
                      <Field data-invalid={!!memberForm.formState.errors.email}>
                        <FieldLabel htmlFor="m-email">Email</FieldLabel>
                        <Input
                          id="m-email"
                          type="email"
                          aria-invalid={!!memberForm.formState.errors.email}
                          {...memberForm.register("email")}
                        />
                        <FieldError
                          errors={[memberForm.formState.errors.email]}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Role</FieldLabel>
                        <Select
                          value={memberForm.watch("role")}
                          onValueChange={(v) => {
                            if (v) memberForm.setValue("role", v)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                    <Button
                      type="submit"
                      disabled={memberForm.formState.isSubmitting}
                    >
                      {memberForm.formState.isSubmitting ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Adding…
                        </>
                      ) : (
                        "Invite"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="destructive" onClick={onDeleteProject}>
                Delete project
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Assignees must be members of the project.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {project.members?.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">
                    {m.user?.displayName || m.user?.email || m.userId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.user?.email}
                  </p>
                </div>
                <Badge variant="secondary">{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labels</CardTitle>
            <CardDescription>
              Create labels when managing issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {!project.labels?.length && (
              <p className="text-sm text-muted-foreground">No labels yet.</p>
            )}
            {project.labels?.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full border border-border"
                  style={{
                    backgroundColor: l.color || "var(--muted)",
                  }}
                />
                <span className="text-sm">{l.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />
    </div>
  )
}
