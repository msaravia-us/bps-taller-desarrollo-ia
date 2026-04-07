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
  return prisma.comment.create({ data });
}

module.exports = {
  countComments,
  findComments,
  createComment,
};
