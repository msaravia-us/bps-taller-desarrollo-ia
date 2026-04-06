const { Router } = require("express");
const { prisma } = require("../../shared/db/prisma");
const { HttpError } = require("../../shared/errors/httpError");
const { requireAuth } = require("../../shared/middlewares/auth");
const {
  issueSchema,
  updateIssueSchema,
  issueQuerySchema,
  createLabelSchema,
} = require("./issues.schemas");

const router = Router();
router.use(requireAuth);

async function canAccessProject(projectId, userId) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return Boolean(member);
}

router.post("/projects/:projectId/issues", async (req, res) => {
  const body = issueSchema.parse(req.body);
  if (!(await canAccessProject(req.params.projectId, req.user.id))) throw new HttpError(403, "Sin acceso al proyecto");
  const issue = await prisma.issue.create({
    data: {
      projectId: req.params.projectId,
      title: body.title,
      description: body.description,
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      assigneeId: body.assigneeId || null,
      createdById: req.user.id,
      issueLabels: body.labelIds?.length
        ? { create: body.labelIds.map((labelId) => ({ labelId })) }
        : undefined,
    },
    include: { issueLabels: true },
  });
  res.status(201).json(issue);
});

router.get("/projects/:projectId/issues", async (req, res) => {
  if (!(await canAccessProject(req.params.projectId, req.user.id))) throw new HttpError(403, "Project access denied");
  const normalizedQuery = {
    ...req.query,
    pageSize: req.query.pageSize ?? req.query.page_size,
    assigneeId: req.query.assigneeId ?? req.query.assignee_id,
  };
  const q = issueQuerySchema.parse(normalizedQuery);
  const where = {
    projectId: req.params.projectId,
    status: q.status,
    priority: q.priority,
    assigneeId: q.assigneeId,
    OR: q.q
      ? [{ title: { contains: q.q } }, { description: { contains: q.q } }]
      : undefined,
  };
  const [total, issues] = await Promise.all([
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      orderBy: { createdAt: "desc" },
      include: { assignee: true, issueLabels: { include: { label: true } } },
    }),
  ]);
  res.json({ items: issues, total, page: q.page, pageSize: q.pageSize });
});

router.get("/issues/:issueId", async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: req.params.issueId },
    include: { assignee: true, comments: true, issueLabels: { include: { label: true } } },
  });
  if (!issue) throw new HttpError(404, "Issue not found");
  if (!(await canAccessProject(issue.projectId, req.user.id))) throw new HttpError(403, "Project access denied");
  res.json(issue);
});

router.patch("/issues/:issueId", async (req, res) => {
  const normalizedBody = {
    ...req.body,
    status: req.body?.status === "in_progress" ? "IN_PROGRESS" : req.body?.status,
  };
  const body = updateIssueSchema.parse(normalizedBody);
  const existing = await prisma.issue.findUnique({ where: { id: req.params.issueId } });
  if (!existing) throw new HttpError(404, "Issue not found");
  if (!(await canAccessProject(existing.projectId, req.user.id))) throw new HttpError(403, "Project access denied");

  const issue = await prisma.issue.update({
    where: { id: req.params.issueId },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      assigneeId: body.assigneeId,
      issueLabels: body.labelIds
        ? {
            deleteMany: {},
            create: body.labelIds.map((labelId) => ({ labelId })),
          }
        : undefined,
    },
    include: { issueLabels: true },
  });
  res.json(issue);
});

router.delete("/issues/:issueId", async (req, res) => {
  const existing = await prisma.issue.findUnique({ where: { id: req.params.issueId } });
  if (!existing) throw new HttpError(404, "Issue not found");
  if (!(await canAccessProject(existing.projectId, req.user.id))) throw new HttpError(403, "Project access denied");
  await prisma.issue.delete({ where: { id: req.params.issueId } });
  res.status(204).send();
});

router.post("/projects/:projectId/labels", async (req, res) => {
  if (!(await canAccessProject(req.params.projectId, req.user.id))) throw new HttpError(403, "Project access denied");
  const body = createLabelSchema.parse(req.body);
  const label = await prisma.label.create({
    data: { projectId: req.params.projectId, name: body.name, color: body.color || null },
  });
  res.status(201).json(label);
});

module.exports = { issuesRouter: router };
