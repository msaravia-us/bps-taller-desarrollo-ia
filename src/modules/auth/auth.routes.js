const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../shared/db/prisma");
const { JWT_SECRET, requireAuth } = require("../../shared/middlewares/auth");
const { HttpError } = require("../../shared/errors/httpError");
const { registerSchema, loginSchema } = require("./auth.schemas");

const router = Router();

router.post("/register", async (req, res, next) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new HttpError(409, "User already exists");

  const user = await prisma.user.create({
    data: { email: data.email.toLowerCase(), displayName: data.displayName },
  });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  console.log("[auth] nuevo usuario:", data.email);
  res.status(201).json({ data: { token, user } });
});

router.post("/login", async (req, res, next) => {
  const data = loginSchema.parse(req.body);
  let user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user) throw new HttpError(404, "User not found");
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8d" });
  res.json({ accessToken: token, user });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

module.exports = { authRouter: router };
