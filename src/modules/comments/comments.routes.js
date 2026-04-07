const { Router } = require("express");
const { requireAuth } = require("../../shared/middlewares/auth");
const {
  createCommentSchema,
  commentListQuerySchema,
  toCommentResponse,
  toCommentListResponse,
} = require("./comments.schemas");
const service = require("./comments.service");

const router = Router();
router.use(requireAuth);

router.post("/issues/:issueId/comments", async (req, res) => {
  const body = createCommentSchema.parse(req.body);
  const comment = await service.createComment(req.params.issueId, body, req.user.id);
  res.status(201).json(toCommentResponse(comment));
});

router.get("/issues/:issueId/comments", async (req, res) => {
  const query = commentListQuerySchema.parse(req.query);
  const result = await service.listComments(req.params.issueId, req.user.id, query);
  res.json(toCommentListResponse(result));
});

module.exports = { commentsRouter: router };
