const jwt = require("jsonwebtoken");
const { HttpError } = require("../../shared/errors/httpError");
const { JWT_SECRET } = require("../../shared/middlewares/auth");
const repository = require("./auth.repository");

const JWT_EXPIRES_IN = "7d";

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(input) {
  const email = input.email.toLowerCase();
  const existing = await repository.findUserByEmail(email);
  if (existing) throw new HttpError(409, "User already exists");

  const user = await repository.createUser({
    email,
    displayName: input.displayName,
  });
  const token = signToken(user);
  return { token, user };
}

async function login(input) {
  const email = input.email.toLowerCase();
  const user = await repository.findUserByEmail(email);
  if (!user) throw new HttpError(404, "User not found");
  const token = signToken(user);
  return { token, user };
}

module.exports = {
  register,
  login,
};
