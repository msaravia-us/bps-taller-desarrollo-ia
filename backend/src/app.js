const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { authRouter } = require("./modules/auth/auth.routes");
const { projectsRouter } = require("./modules/projects/projects.routes");
const { issuesRouter } = require("./modules/issues/issues.routes");
const { commentsRouter } = require("./modules/comments/comments.routes");
const { getOpenApiSpec } = require("./docs/openapi");
const { errorHandler } = require("./shared/middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));

app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/", issuesRouter);
app.use("/", commentsRouter);

app.use(errorHandler);

module.exports = { app };
