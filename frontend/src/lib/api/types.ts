export type ProjectRole = "OWNER" | "MEMBER"

export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE"

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH"

export type User = {
  id: string
  email: string
  displayName: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectMember = {
  id: string
  projectId: string
  userId: string
  role: ProjectRole
  createdAt: string
  user?: User
}

export type Label = {
  id: string
  projectId: string
  name: string
  color: string | null
  createdAt: string
}

export type Project = {
  id: string
  name: string
  key: string
  description: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  members?: ProjectMember[]
  labels?: Label[]
}

export type IssueLabelRow = {
  issueId: string
  labelId: string
  label: Label
}

export type Issue = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: IssueStatus
  priority: IssuePriority
  assigneeId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  assignee?: User | null
  issueLabels?: IssueLabelRow[]
  comments?: Comment[]
}

export type PaginatedIssues = {
  items: Issue[]
  total: number
  page: number
  pageSize: number
}

export type Comment = {
  id: string
  issueId: string
  authorId: string
  body: string
  createdAt: string
  updatedAt: string
  author?: User
}

export type PaginatedComments = {
  items: Comment[]
  total: number
  page: number
  pageSize: number
}

export type AuthPayload = {
  token: string
  user: User
}

export type MeResponse = {
  user: User
}
