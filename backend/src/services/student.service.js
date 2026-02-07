import { createStudent, findStudentByEmail } from "../models/student.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../config/jwt.js";

export const registerStudent = async (name, email, password) => {
  const existing = await findStudentByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hashed = await hashPassword(password);
  return await createStudent(name, email, hashed);
};

export const loginStudent = async (email, password) => {
  const student = await findStudentByEmail(email);
  if (!student) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(password, student.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken({ userId: student.id, role: "Student" });
  return { token, student };
};
