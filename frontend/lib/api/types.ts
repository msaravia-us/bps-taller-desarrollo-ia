export type User = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
};

export type ProjectMember = {
  userId: string;
  role: string;
  user: Pick<User, "id" | "email" | "displayName">;
};

export type ProjectLabel = {
  id: string;
  projectId: string;
  name: string;
  color: string | null;
  createdAt: string;
};

/** GET /projects/:projectId */
export type ProjectDetail = Project & {
  members: ProjectMember[];
  labels: ProjectLabel[];
};

/** Body for POST /projects */
export type CreateProjectInput = {
  name: string;
  key: string;
  description?: string;
};

/** Body for PATCH /projects/:projectId */
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type Issue = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, "id" | "email" | "displayName"> | null;
  /** Present when listing via GET /issues */
  project?: Project;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Body for POST /projects/:projectId/issues */
export type CreateIssueInput = {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  labelIds?: string[];
};

/** Body for PATCH /issues/:issueId */
export type UpdateIssueInput = Partial<CreateIssueInput>;
