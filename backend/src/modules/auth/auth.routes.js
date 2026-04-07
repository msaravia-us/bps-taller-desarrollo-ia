const { Router } = require("express");
const { requireAuth } = require("../../shared/middlewares/auth");
const { registerSchema, loginSchema, toAuthResponse, toMeResponse } = require("./auth.schemas");
const service = require("./auth.service");

const router = Router();

router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const result = await service.register(data);
  res.status(201).json(toAuthResponse(result));
});

router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const result = await service.login(data);
  res.json(toAuthResponse(result));
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(toMeResponse(req.user));
});

module.exports = { authRouter: router };
