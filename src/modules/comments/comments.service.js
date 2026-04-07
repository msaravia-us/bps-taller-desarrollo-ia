const { HttpError } = require("../../shared/errors/httpError");
const projectsRepository = require("../projects/projects.repository");
const issuesRepository = require("../issues/issues.repository");
const repository = require("./comments.repository");

async function assertIssueAccess(issueId, userId) {
  const issue = await issuesRepository.findIssueByIdBrief(issueId);
  if (!issue) throw new HttpError(404, "Issue not found");
  const project = await projectsRepository.findProjectByIdForUser(issue.projectId, userId);
  if (!project) throw new HttpError(404, "Issue not found");
  return issue;
}

async function createComment(issueId, body, userId) {
  await assertIssueAccess(issueId, userId);
  return repository.createComment({
    issueId,
    authorId: userId,
    body: body.body,
  });
}

async function listComments(issueId, userId, query) {
  await assertIssueAccess(issueId, userId);

  const where = { issueId };

  const [total, items] = await Promise.all([
    repository.countComments(where),
    repository.findComments(where, {
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

module.exports = {
  createComment,
  listComments,
};
