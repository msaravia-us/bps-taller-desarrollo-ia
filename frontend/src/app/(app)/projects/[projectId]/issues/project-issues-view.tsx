"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api/client"
import type {
  Issue,
  IssuePriority,
  IssueStatus,
  Label,
  PaginatedIssues,
  Project,
} from "@/lib/api/types"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

const issueFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
})

type IssueFormValues = z.infer<typeof issueFormSchema>

const labelFormSchema = z.object({
  name: z.string().trim().min(1).max(30),
  color: z.string().max(10).optional(),
})

type LabelFormValues = z.infer<typeof labelFormSchema>

function statusVariant(
  s: IssueStatus
): "default" | "secondary" | "outline" {
  if (s === "DONE") return "secondary"
  if (s === "IN_PROGRESS") return "default"
  return "outline"
}

function priorityVariant(
  p: IssuePriority
): "default" | "secondary" | "destructive" | "outline" {
  if (p === "HIGH") return "destructive"
  if (p === "LOW") return "outline"
  return "secondary"
}

export function ProjectIssuesView() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId
  const { token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const statusQ = searchParams.get("status") as IssueStatus | "" | null
  const priorityQ = searchParams.get("priority") as IssuePriority | "" | null
  const qParam = searchParams.get("q") || ""

  const [project, setProject] = useState<Project | null>(null)
  const [pageData, setPageData] = useState<PaginatedIssues | null>(null)
  const [loading, setLoading] = useState(true)
  const [issueOpen, setIssueOpen] = useState(false)
  const [labelOpen, setLabelOpen] = useState(false)

  const loadProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const p = await apiFetch<Project>(`/projects/${projectId}`, { token })
      setProject(p)
    } catch {
      setProject(null)
    }
  }, [token, projectId])

  const loadIssues = useCallback(async () => {
    if (!token || !projectId) return
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (statusQ) qs.set("status", statusQ)
      if (priorityQ) qs.set("priority", priorityQ)
      if (qParam) qs.set("q", qParam)
      qs.set("page", String(page))
      qs.set("pageSize", "10")
      const data = await apiFetch<PaginatedIssues>(
        `/projects/${projectId}/issues?${qs.toString()}`,
        { token }
      )
      setPageData(data)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load issues")
      setPageData({ items: [], total: 0, page: 1, pageSize: 10 })
    } finally {
      setLoading(false)
    }
  }, [token, projectId, statusQ, priorityQ, qParam, page])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  useEffect(() => {
    loadIssues()
  }, [loadIssues])

  const issueForm = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
    },
  })

  const labelForm = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: { name: "", color: "#3b82f6" },
  })

  function setFilter(updates: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "") p.delete(k)
      else p.set(k, v)
    })
    if (!updates.page) p.delete("page")
    router.push(`/projects/${projectId}/issues?${p.toString()}`)
  }

  async function onCreateIssue(values: IssueFormValues) {
    if (!token || !projectId) return
    try {
      const created = await apiFetch<Issue>(`/projects/${projectId}/issues`, {
        method: "POST",
        token,
        body: {
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          status: values.status,
          priority: values.priority,
        },
      })
      toast.success("Issue created")
      setIssueOpen(false)
      issueForm.reset({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
      })
      router.push(`/issues/${created.id}`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not create issue")
    }
  }

  async function onCreateLabel(values: LabelFormValues) {
    if (!token || !projectId) return
    try {
      await apiFetch<Label>(`/projects/${projectId}/labels`, {
        method: "POST",
        token,
        body: {
          name: values.name.trim(),
          color: values.color?.trim() || undefined,
        },
      })
      toast.success("Label created")
      setLabelOpen(false)
      labelForm.reset({ name: "", color: "#3b82f6" })
      loadProject()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not create label")
    }
  }

  const totalPages = pageData
    ? Math.max(1, Math.ceil(pageData.total / pageData.pageSize))
    : 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <span className="px-1">/</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">
            {project?.key ?? "…"}
          </Link>
          <span className="px-1">/</span>
          <span>Issues</span>
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
          <div className="flex flex-wrap gap-2">
            <Dialog open={labelOpen} onOpenChange={setLabelOpen}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLabelOpen(true)}
              >
                New label
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New label</DialogTitle>
                  <DialogDescription>
                    Labels can be attached when editing an issue.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={labelForm.handleSubmit(onCreateLabel)}
                  className="flex flex-col gap-4"
                >
                  <FieldGroup>
                    <Field data-invalid={!!labelForm.formState.errors.name}>
                      <FieldLabel htmlFor="l-name">Name</FieldLabel>
                      <Input
                        id="l-name"
                        aria-invalid={!!labelForm.formState.errors.name}
                        {...labelForm.register("name")}
                      />
                      <FieldError errors={[labelForm.formState.errors.name]} />
                    </Field>
                    <Field data-invalid={!!labelForm.formState.errors.color}>
                      <FieldLabel htmlFor="l-color">Color (optional)</FieldLabel>
                      <Input
                        id="l-color"
                        placeholder="#3b82f6"
                        aria-invalid={!!labelForm.formState.errors.color}
                        {...labelForm.register("color")}
                      />
                      <FieldError
                        errors={[labelForm.formState.errors.color]}
                      />
                    </Field>
                  </FieldGroup>
                  <Button
                    type="submit"
                    disabled={labelForm.formState.isSubmitting}
                  >
                    {labelForm.formState.isSubmitting ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Saving…
                      </>
                    ) : (
                      "Create label"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <Button type="button" onClick={() => setIssueOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                New issue
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New issue</DialogTitle>
                  <DialogDescription>
                    Create a ticket in {project?.name ?? "this project"}.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={issueForm.handleSubmit(onCreateIssue)}
                  className="flex flex-col gap-4"
                >
                  <FieldGroup>
                    <Field data-invalid={!!issueForm.formState.errors.title}>
                      <FieldLabel htmlFor="i-title">Title</FieldLabel>
                      <Input
                        id="i-title"
                        aria-invalid={!!issueForm.formState.errors.title}
                        {...issueForm.register("title")}
                      />
                      <FieldError errors={[issueForm.formState.errors.title]} />
                    </Field>
                    <Field
                      data-invalid={!!issueForm.formState.errors.description}
                    >
                      <FieldLabel htmlFor="i-desc">Description</FieldLabel>
                      <Textarea
                        id="i-desc"
                        aria-invalid={
                          !!issueForm.formState.errors.description
                        }
                        {...issueForm.register("description")}
                      />
                      <FieldError
                        errors={[issueForm.formState.errors.description]}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={issueForm.watch("status")}
                        onValueChange={(v) => {
                          if (v) issueForm.setValue("status", v)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">To do</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In progress
                          </SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Priority</FieldLabel>
                      <Select
                        value={issueForm.watch("priority")}
                        onValueChange={(v) => {
                          if (v) issueForm.setValue("priority", v)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <Button
                    type="submit"
                    disabled={issueForm.formState.isSubmitting}
                  >
                    {issueForm.formState.isSubmitting ? (
                      <>
                        <Spinner data-icon="inline-start" />
                        Creating…
                      </>
                    ) : (
                      "Create issue"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="filter-q">Search</FieldLabel>
          <Input
            id="filter-q"
            defaultValue={qParam}
            placeholder="Title or description"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilter({ q: e.currentTarget.value.trim() || null })
              }
            }}
          />
        </Field>
        <Field className="w-full max-w-[200px]">
          <FieldLabel>Status</FieldLabel>
          <Select
            value={statusQ || "all"}
            onValueChange={(v) => {
              if (v == null) return
              setFilter({ status: v === "all" ? null : v, page: null })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="TODO">To do</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full max-w-[200px]">
          <FieldLabel>Priority</FieldLabel>
          <Select
            value={priorityQ || "all"}
            onValueChange={(v) => {
              if (v == null) return
              setFilter({ priority: v === "all" ? null : v, page: null })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setFilter({ status: null, priority: null, q: null, page: null })
          }
        >
          Clear filters
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!loading && pageData && pageData.items.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No issues match</EmptyTitle>
            <EmptyDescription>
              Adjust filters or create a new issue.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && pageData && pageData.items.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.items.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Link
                      href={`/issues/${issue.id}`}
                      className="font-medium hover:underline"
                    >
                      {issue.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {issue.assignee?.displayName ||
                      issue.assignee?.email ||
                      "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(issue.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && pageData && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pageData.page} of {totalPages} — {pageData.total} issues
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() =>
                setFilter({
                  page: String(Math.max(1, page - 1)),
                })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() =>
                setFilter({
                  page: String(Math.min(totalPages, page + 1)),
                })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
