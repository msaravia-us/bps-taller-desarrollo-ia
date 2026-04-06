const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.issueLabel.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.label.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const ana = await prisma.user.create({
    data: { email: "ana@workshop.dev", displayName: "Ana" },
  });
  const leo = await prisma.user.create({
    data: { email: "leo@workshop.dev", displayName: "Leo" },
  });

  const project = await prisma.project.create({
    data: {
      name: "Workshop Tracker",
      key: "WST",
      description: "Proyecto de ejemplo para el curso.",
      createdById: ana.id,
      members: {
        create: [
          { userId: ana.id, role: "OWNER" },
          { userId: leo.id, role: "MEMBER" },
        ],
      },
    },
  });

  const bugLabel = await prisma.label.create({
    data: { projectId: project.id, name: "bug", color: "#ef4444" },
  });

  const issue = await prisma.issue.create({
    data: {
      projectId: project.id,
      title: "Error al crear issue sin título",
      description: "Validar correctamente payload en endpoint.",
      status: "TODO",
      priority: "HIGH",
      assigneeId: leo.id,
      createdById: ana.id,
      issueLabels: { create: [{ labelId: bugLabel.id }] },
    },
  });

  await prisma.comment.create({
    data: {
      issueId: issue.id,
      authorId: ana.id,
      body: "Reproducible en entorno local.",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
