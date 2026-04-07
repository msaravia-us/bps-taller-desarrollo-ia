"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PencilIcon, TrashIcon } from "lucide-react"
import { apiFetch, ApiError } from "@/lib/api/client"
import type {
  Comment,
  Issue,
  IssuePriority,
  IssueStatus,
  PaginatedComments,
  Project,
} from "@/lib/api/types"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const issueEditSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.string().nullable().optional(),
})

type IssueEditValues = z.infer<typeof issueEditSchema>

const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
})

type CommentValues = z.infer<typeof commentSchema>

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

export default function IssueDetailPage() {
  const params = useParams<{ issueId: string }>()
  const issueId = params.issueId
  const { token, user } = useAuth()
  const router = useRouter()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<PaginatedComments | null>(null)
  const [commentPage, setCommentPage] = useState(1)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)

  const loadIssue = useCallback(async () => {
    if (!token || !issueId) return
    try {
      const i = await apiFetch<Issue>(`/issues/${issueId}`, { token })
      setIssue(i)
      const ids =
        i.issueLabels?.map((row) => row.labelId).filter(Boolean) ?? []
      setLabelIds(ids)
      const p = await apiFetch<Project>(`/projects/${i.projectId}`, { token })
      setProject(p)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load issue")
      setIssue(null)
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [token, issueId])

  const loadComments = useCallback(async () => {
    if (!token || !issueId) return
    try {
      const qs = new URLSearchParams({
        page: String(commentPage),
        pageSize: "10",
      })
      const data = await apiFetch<PaginatedComments>(
        `/issues/${issueId}/comments?${qs.toString()}`,
        { token }
      )
      setComments(data)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not load comments")
      setComments({ items: [], total: 0, page: 1, pageSize: 10 })
    }
  }, [token, issueId, commentPage])

  useEffect(() => {
    setLoading(true)
    loadIssue()
  }, [loadIssue])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const issueForm = useForm<IssueEditValues>({
    resolver: zodResolver(issueEditSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: null,
    },
  })

  useEffect(() => {
    if (!issue) return
    issueForm.reset({
      title: issue.title,
      description: issue.description ?? "",
      status: issue.status,
      priority: issue.priority,
      assigneeId: issue.assigneeId,
    })
  }, [issue, issueForm])

  const commentForm = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  })

  const editCommentForm = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  })

  function toggleLabel(id: string, checked: boolean) {
    setLabelIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  async function onSaveIssue(values: IssueEditValues) {
    if (!token || !issueId) return
    try {
      const updated = await apiFetch<Issue>(`/issues/${issueId}`, {
        method: "PATCH",
        token,
        body: {
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          status: values.status,
          priority: values.priority,
          assigneeId: values.assigneeId ?? null,
          labelIds,
        },
      })
      setIssue(updated)
      const ids =
        updated.issueLabels?.map((row) => row.labelId).filter(Boolean) ?? []
      setLabelIds(ids)
      toast.success("Issue updated")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not save")
    }
  }

  async function onDeleteIssue() {
    if (!token || !issueId || !issue) return
    if (!confirm("Delete this issue permanently?")) return
    try {
      await apiFetch(`/issues/${issueId}`, { method: "DELETE", token })
      toast.success("Issue deleted")
      router.replace(`/projects/${issue.projectId}/issues`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not delete")
    }
  }

  async function onAddComment(values: CommentValues) {
    if (!token || !issueId) return
    try {
      await apiFetch<Comment>(`/issues/${issueId}/comments`, {
        method: "POST",
        token,
        body: { body: values.body.trim() },
      })
      toast.success("Comment added")
      commentForm.reset({ body: "" })
      setCommentPage(1)
      loadComments()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not comment")
    }
  }

  async function onSaveComment(commentId: string, values: CommentValues) {
    if (!token || !issueId) return
    try {
      await apiFetch<Comment>(
        `/issues/${issueId}/comments/${commentId}`,
        {
          method: "PATCH",
          token,
          body: { body: values.body.trim() },
        }
      )
      toast.success("Comment updated")
      setEditingCommentId(null)
      loadComments()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not update")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-3/4 max-w-lg" />
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    )
  }

  if (!issue || !project) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Issue not found</AlertTitle>
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

  const commentPages = comments
    ? Math.max(1, Math.ceil(comments.total / comments.pageSize))
    : 1

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <span className="px-1">/</span>
          <Link
            href={`/projects/${project.id}`}
            className="hover:underline"
          >
            {project.key}
          </Link>
          <span className="px-1">/</span>
          <Link
            href={`/projects/${project.id}/issues`}
            className="hover:underline"
          >
            Issues
          </Link>
          <span className="px-1">/</span>
          <span className="font-mono text-xs">{issue.id.slice(0, 8)}…</span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(issue.status)}>
              {issue.status.replace("_", " ")}
            </Badge>
            <Badge variant={priorityVariant(issue.priority)}>
              {issue.priority}
            </Badge>
          </div>
          <Button variant="destructive" onClick={onDeleteIssue}>
            <TrashIcon data-icon="inline-start" />
            Delete issue
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit issue</CardTitle>
          <CardDescription>
            Changes are saved to the API with your membership permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={issueForm.handleSubmit(onSaveIssue)}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <Field data-invalid={!!issueForm.formState.errors.title}>
                <FieldLabel htmlFor="issue-title">Title</FieldLabel>
                <Input
                  id="issue-title"
                  aria-invalid={!!issueForm.formState.errors.title}
                  {...issueForm.register("title")}
                />
                <FieldError errors={[issueForm.formState.errors.title]} />
              </Field>
              <Field data-invalid={!!issueForm.formState.errors.description}>
                <FieldLabel htmlFor="issue-desc">Description</FieldLabel>
                <Textarea
                  id="issue-desc"
                  aria-invalid={!!issueForm.formState.errors.description}
                  {...issueForm.register("description")}
                />
                <FieldError
                  errors={[issueForm.formState.errors.description]}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
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
                      <SelectItem value="IN_PROGRESS">In progress</SelectItem>
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
              </div>
              <Field>
                <FieldLabel>Assignee</FieldLabel>
                <Select
                  value={issueForm.watch("assigneeId") ?? "none"}
                  onValueChange={(v) => {
                    if (v == null) return
                    issueForm.setValue("assigneeId", v === "none" ? null : v)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {project.members?.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user?.displayName || m.user?.email || m.userId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldSet className="rounded-lg border p-4">
              <FieldLegend variant="label">Labels</FieldLegend>
              <FieldDescription className="mb-3">
                Toggle labels for this issue; include at least your project
                labels.
              </FieldDescription>
              <div className="flex flex-col gap-3">
                {project.labels?.map((label) => (
                  <Field
                    key={label.id}
                    orientation="horizontal"
                    className="items-center"
                  >
                    <Checkbox
                      id={`label-${label.id}`}
                      checked={labelIds.includes(label.id)}
                      onCheckedChange={(v) =>
                        toggleLabel(label.id, v === true)
                      }
                    />
                    <FieldLabel
                      htmlFor={`label-${label.id}`}
                      className="font-normal"
                    >
                      <span
                        className="mr-2 inline-block size-2.5 rounded-full border border-border align-middle"
                        style={{
                          backgroundColor: label.color || "var(--muted)",
                        }}
                      />
                      {label.name}
                    </FieldLabel>
                  </Field>
                ))}
                {!project.labels?.length && (
                  <p className="text-sm text-muted-foreground">
                    No labels in this project yet.
                  </p>
                )}
              </div>
            </FieldSet>

            <Button type="submit" disabled={issueForm.formState.isSubmitting}>
              {issueForm.formState.isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Comments</h2>
          <p className="text-sm text-muted-foreground">
            Newest activity is paginated from the API.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={commentForm.handleSubmit(onAddComment)}
              className="flex flex-col gap-4"
            >
              <Field data-invalid={!!commentForm.formState.errors.body}>
                <FieldLabel htmlFor="comment-body">Message</FieldLabel>
                <Textarea
                  id="comment-body"
                  aria-invalid={!!commentForm.formState.errors.body}
                  {...commentForm.register("body")}
                />
                <FieldError errors={[commentForm.formState.errors.body]} />
              </Field>
              <Button
                type="submit"
                disabled={commentForm.formState.isSubmitting}
              >
                {commentForm.formState.isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Posting…
                  </>
                ) : (
                  "Post comment"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {comments?.items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {c.author?.displayName || c.author?.email || "User"}
                  </CardTitle>
                  <CardDescription>
                    {new Date(c.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                {user?.id === c.authorId && (
                  <Dialog
                    open={editingCommentId === c.id}
                    onOpenChange={(open) => {
                      if (!open) setEditingCommentId(null)
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCommentId(c.id)
                        editCommentForm.reset({ body: c.body })
                      }}
                    >
                      <PencilIcon data-icon="inline-start" />
                      Edit
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit comment</DialogTitle>
                        <DialogDescription>
                          Only the author can update this comment.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={editCommentForm.handleSubmit((vals) =>
                          onSaveComment(c.id, vals)
                        )}
                        className="flex flex-col gap-4"
                      >
                        <Field
                          data-invalid={!!editCommentForm.formState.errors.body}
                        >
                          <FieldLabel htmlFor={`edit-${c.id}`}>
                            Message
                          </FieldLabel>
                          <Textarea
                            id={`edit-${c.id}`}
                            aria-invalid={
                              !!editCommentForm.formState.errors.body
                            }
                            {...editCommentForm.register("body")}
                          />
                          <FieldError
                            errors={[editCommentForm.formState.errors.body]}
                          />
                        </Field>
                        <Button
                          type="submit"
                          disabled={editCommentForm.formState.isSubmitting}
                        >
                          {editCommentForm.formState.isSubmitting ? (
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
                )}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              </CardContent>
            </Card>
          ))}
          {!comments?.items.length && (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
        </div>

        {comments && commentPages > 1 && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Page {comments.page} of {commentPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={commentPage <= 1}
                onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={commentPage >= commentPages}
                onClick={() =>
                  setCommentPage((p) => Math.min(commentPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
