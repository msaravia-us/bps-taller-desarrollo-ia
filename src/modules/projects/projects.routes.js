const { Router } = require("express");
const { requireAuth } = require("../../shared/middlewares/auth");
const {
  projectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  toProjectResponse,
  toProjectsResponse,
} = require("./projects.schemas");
const service = require("./projects.service");

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const body = projectSchema.parse(req.body);
  const project = await service.createProject(body, req.user.id);
  res.status(201).json(toProjectResponse(project));
});

router.get("/", async (req, res) => {
  const projects = await service.listProjects(req.user.id);
  res.json(toProjectsResponse(projects));
});

router.get("/:projectId", async (req, res) => {
  const project = await service.getProject(req.params.projectId, req.user.id);
  res.json(toProjectResponse(project));
});

router.patch("/:projectId", async (req, res) => {
  const body = updateProjectSchema.parse(req.body);
  const project = await service.updateProject(req.params.projectId, body, req.user.id);
  res.json(toProjectResponse(project));
});

router.delete("/:projectId", async (req, res) => {
  await service.removeProject(req.params.projectId, req.user.id);
  res.status(204).send();
});

router.post("/:projectId/members", async (req, res) => {
  const body = addProjectMemberSchema.parse(req.body);
  const membership = await service.addMember(req.params.projectId, body.email, body.role, req.user.id);
  res.status(201).json(membership);
});

module.exports = { projectsRouter: router };
