const jwt = require("jsonwebtoken");
const { HttpError } = require("../errors/httpError");
const { prisma } = require("../db/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new HttpError(401, "Invalid token user");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err.name === "JsonWebTokenError" ? new HttpError(401, "Invalid token") : err);
  }
}

module.exports = { requireAuth, JWT_SECRET };
