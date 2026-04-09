const { Router } = require("express");
const { requireAuth } = require("../../shared/middlewares/auth");
const {
  issueSchema,
  updateIssueSchema,
  issueQuerySchema,
  allIssuesQuerySchema,
  createLabelSchema,
  toIssueResponse,
  toIssueListResponse,
  toLabelResponse,
} = require("./issues.schemas");
const service = require("./issues.service");

const router = Router();
router.use(requireAuth);

router.post("/projects/:projectId/issues", async (req, res) => {
  const body = issueSchema.parse(req.body);
  const issue = await service.createIssue(req.params.projectId, body, req.user.id);
  res.status(201).json(toIssueResponse(issue));
});

router.get("/projects/:projectId/issues", async (req, res) => {
  const q = issueQuerySchema.parse(req.query);
  const result = await service.listIssues(req.params.projectId, req.user.id, q);
  res.json(toIssueListResponse(result));
});

router.get("/issues", async (req, res) => {
  const q = allIssuesQuerySchema.parse(req.query);
  const result = await service.listAllAccessibleIssues(req.user.id, q);
  res.json(toIssueListResponse(result));
});

router.get("/issues/:issueId", async (req, res) => {
  const issue = await service.getIssue(req.params.issueId, req.user.id);
  res.json(toIssueResponse(issue));
});

router.patch("/issues/:issueId", async (req, res) => {
  const body = updateIssueSchema.parse(req.body);
  const issue = await service.updateIssue(req.params.issueId, body, req.user.id);
  res.json(toIssueResponse(issue));
});

router.delete("/issues/:issueId", async (req, res) => {
  await service.removeIssue(req.params.issueId, req.user.id);
  res.status(204).send();
});

router.post("/projects/:projectId/labels", async (req, res) => {
  const body = createLabelSchema.parse(req.body);
  const label = await service.createLabel(req.params.projectId, body, req.user.id);
  res.status(201).json(toLabelResponse(label));
});

module.exports = { issuesRouter: router };
