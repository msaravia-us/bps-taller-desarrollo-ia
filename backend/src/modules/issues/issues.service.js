const { HttpError } = require("../../shared/errors/httpError");
const projectsRepository = require("../projects/projects.repository");
const repository = require("./issues.repository");

async function assertProjectAccess(projectId, userId) {
  const project = await projectsRepository.findProjectByIdForUser(projectId, userId);
  if (!project) throw new HttpError(404, "Project not found");
  return project;
}

async function assertAssigneeIsMember(projectId, assigneeId) {
  if (!assigneeId) return;
  const member = await projectsRepository.findMembership(projectId, assigneeId);
  if (!member) throw new HttpError(400, "Assignee must be a project member");
}

async function getIssueForUser(issueId, userId) {
  const issue = await repository.findIssueById(issueId);
  if (!issue) throw new HttpError(404, "Issue not found");
  const project = await projectsRepository.findProjectByIdForUser(issue.projectId, userId);
  if (!project) throw new HttpError(404, "Issue not found");
  return issue;
}

async function getIssueBriefForUser(issueId, userId) {
  const issue = await repository.findIssueByIdBrief(issueId);
  if (!issue) throw new HttpError(404, "Issue not found");
  const project = await projectsRepository.findProjectByIdForUser(issue.projectId, userId);
  if (!project) throw new HttpError(404, "Issue not found");
  return issue;
}

async function createIssue(projectId, body, userId) {
  await assertProjectAccess(projectId, userId);
  await assertAssigneeIsMember(projectId, body.assigneeId ?? null);

  const data = {
    projectId,
    title: body.title,
    description: body.description,
    status: body.status ?? "TODO",
    priority: body.priority ?? "MEDIUM",
    assigneeId: body.assigneeId ?? null,
    createdById: userId,
    issueLabels: body.labelIds?.length
      ? { create: body.labelIds.map((labelId) => ({ labelId })) }
      : undefined,
  };

  return repository.createIssue(data);
}

async function listIssues(projectId, userId, query) {
  await assertProjectAccess(projectId, userId);

  const where = {
    projectId,
    status: query.status,
    priority: query.priority,
    assigneeId: query.assigneeId,
    OR: query.q ? [{ title: { contains: query.q } }, { description: { contains: query.q } }] : undefined,
  };

  const [total, issues] = await Promise.all([
    repository.countIssues(where),
    repository.findIssues(where, {
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return { items: issues, total, page: query.page, pageSize: query.pageSize };
}

async function getIssue(issueId, userId) {
  return getIssueForUser(issueId, userId);
}

async function updateIssue(issueId, body, userId) {
  const existing = await getIssueBriefForUser(issueId, userId);
  if (body.assigneeId !== undefined) {
    await assertAssigneeIsMember(existing.projectId, body.assigneeId);
  }

  const data = {
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
  };

  return repository.updateIssue(issueId, data);
}

async function removeIssue(issueId, userId) {
  await getIssueBriefForUser(issueId, userId);
  await repository.deleteIssue(issueId);
}

async function createLabel(projectId, body, userId) {
  await assertProjectAccess(projectId, userId);
  return repository.createLabel({
    projectId,
    name: body.name,
    color: body.color ?? null,
  });
}

module.exports = {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  removeIssue,
  createLabel,
};
