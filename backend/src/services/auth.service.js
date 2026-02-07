import { createUser, findUserByEmail } from "../models/user.model.js";
import { generateToken } from "../config/jwt.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

export const registerUser = async (name, email, password, role) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hashed = await hashPassword(password);

  return await createUser(name, email, hashed, role || "Student");
};

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken({ userId: user.id, role: user.role });

  return { token, user };
};
