const { prisma } = require("../../shared/db/prisma");

async function createIssue(data) {
  return prisma.issue.create({
    data,
    include: { issueLabels: true },
  });
}

async function countIssues(where) {
  return prisma.issue.count({ where });
}

async function findIssues(where, { skip, take }) {
  return prisma.issue.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: { assignee: true, issueLabels: { include: { label: true } } },
  });
}

async function findIssuesWithProject(where, { skip, take }) {
  return prisma.issue.findMany({
    where,
    skip,
    take,
    orderBy: { updatedAt: "desc" },
    include: {
      assignee: true,
      project: true,
      issueLabels: { include: { label: true } },
    },
  });
}

async function findIssueById(issueId) {
  return prisma.issue.findUnique({
    where: { id: issueId },
    include: { assignee: true, comments: true, issueLabels: { include: { label: true } } },
  });
}

async function findIssueByIdBrief(issueId) {
  return prisma.issue.findUnique({ where: { id: issueId } });
}

async function updateIssue(issueId, data) {
  return prisma.issue.update({
    where: { id: issueId },
    data,
    include: { issueLabels: true },
  });
}

async function deleteIssue(issueId) {
  return prisma.issue.delete({ where: { id: issueId } });
}

async function createLabel(data) {
  return prisma.label.create({ data });
}

module.exports = {
  createIssue,
  countIssues,
  findIssues,
  findIssuesWithProject,
  findIssueById,
  findIssueByIdBrief,
  updateIssue,
  deleteIssue,
  createLabel,
};
