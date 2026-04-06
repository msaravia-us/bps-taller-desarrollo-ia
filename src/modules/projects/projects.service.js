const { HttpError } = require("../../shared/errors/httpError");
const repository = require("./projects.repository");

async function createProject(input, userId) {
  return repository.createProjectWithOwner({
    ...input,
    createdById: userId,
  });
}

async function listProjects(userId) {
  return repository.findProjectsByUser(userId);
}

async function getProject(projectId, userId) {
  const project = await repository.findProjectByIdForUser(projectId, userId);
  if (!project) throw new HttpError(404, "Project not found");
  return project;
}

async function updateProject(projectId, input, userId) {
  const member = await repository.findMembership(projectId, userId);
  if (!member || member.role !== "OWNER") throw new HttpError(403, "Owner access required");
  return repository.updateProject(projectId, input);
}

async function removeProject(projectId, userId) {
  const member = await repository.findMembership(projectId, userId);
  if (!member || member.role !== "OWNER") throw new HttpError(403, "Owner access required");
  await repository.deleteProject(projectId);
}

async function addMember(projectId, email, role, userId) {
  const owner = await repository.findMembership(projectId, userId);
  if (!owner || owner.role !== "OWNER") throw new HttpError(403, "Owner access required");

  const normalizedEmail = email.toLowerCase();
  let user = await repository.findUserByEmail(normalizedEmail);
  if (!user) user = await repository.createUserByEmail(normalizedEmail);

  return repository.upsertProjectMembership(projectId, user.id, role);
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  removeProject,
  addMember,
};
