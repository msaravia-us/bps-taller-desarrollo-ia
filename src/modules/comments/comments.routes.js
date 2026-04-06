const { Router } = require("express");
const { prisma } = require("../../shared/db/prisma");
const { HttpError } = require("../../shared/errors/httpError");
const { requireAuth } = require("../../shared/middlewares/auth");

const router = Router();
router.use(requireAuth);

async function canAccessIssue(issueId, userId) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return null;
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: issue.projectId, userId } },
  });
  return membership ? issue : null;
}

router.post("/issues/:issueId/comments", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const text = payload.body ?? payload.text ?? payload.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new HttpError(400, "Comment body is required");
    }
    const body = { body: text.trim() };
    const issue = await prisma.issue.findUnique({ where: { id: req.params.issueId } });
    if (!issue) {
      throw new HttpError(403, "Issue access denied");
    }
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: issue.projectId, userId: req.user.id } },
    });
    if (!membership) {
      throw new HttpError(403, "Issue access denied");
    }
    const comment = await prisma.comment.create({
      data: {
        issueId: req.params.issueId,
        authorId: req.user.id,
        body: body.body,
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err.name === "ZodError" ? new HttpError(400, err.issues[0].message) : err);
  }
});

router.get("/issues/:issueId/comments", async (req, res, next) => {
  try {
    const issue = await canAccessIssue(req.params.issueId, req.user.id);
    if (!issue) throw new HttpError(403, "Issue access denied");
    const comments = await prisma.comment.findMany({
      where: { issueId: req.params.issueId },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    });
    res.json({ data: comments, totalCount: comments.length });
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter: router };
