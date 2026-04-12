const { prisma } = require("../../shared/db/prisma");

async function createProjectWithOwner(data) {
  return prisma.project.create({
    data: {
      ...data,
      members: { create: { userId: data.createdById, role: "OWNER" } },
    },
    include: { members: true },
  });
}

async function findProjectsByUser(userId) {
  return prisma.project.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

async function findProjectByIdForUser(projectId, userId) {
  return prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    include: { members: { include: { user: true } }, labels: true },
  });
}

async function findProjectMembersForUser(projectId, userId) {
  return prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    select: {
      members: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      },
    },
  });
}

async function findMembership(projectId, userId) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

async function updateProject(projectId, data) {
  return prisma.project.update({ where: { id: projectId }, data });
}

async function deleteProject(projectId) {
  return prisma.project.delete({ where: { id: projectId } });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUserByEmail(email) {
  return prisma.user.create({ data: { email } });
}

async function upsertProjectMembership(projectId, userId, role) {
  return prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role },
    update: { role },
  });
}

module.exports = {
  createProjectWithOwner,
  findProjectsByUser,
  findProjectByIdForUser,
  findProjectMembersForUser,
  findMembership,
  updateProject,
  deleteProject,
  findUserByEmail,
  createUserByEmail,
  upsertProjectMembership,
};
