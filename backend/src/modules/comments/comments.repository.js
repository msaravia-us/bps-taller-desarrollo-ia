const { prisma } = require("../../shared/db/prisma");

async function countComments(where) {
  return prisma.comment.count({ where });
}

async function findComments(where, { skip, take }) {
  return prisma.comment.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "asc" },
    include: { author: true },
  });
}

async function createComment(data) {
  return prisma.comment.create({
    data,
    include: { author: true },
  });
}

async function findCommentByIdForIssue(commentId, issueId) {
  return prisma.comment.findFirst({
    where: { id: commentId, issueId },
  });
}

async function updateComment(commentId, data) {
  return prisma.comment.update({
    where: { id: commentId },
    data,
    include: { author: true },
  });
}

async function deleteComment(commentId) {
  return prisma.comment.delete({
    where: { id: commentId },
  });
}

module.exports = {
  countComments,
  findComments,
  createComment,
  findCommentByIdForIssue,
  updateComment,
  deleteComment,
};
