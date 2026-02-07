import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Role-based Access Control", () => {
  let adminToken;
  let studentToken;

  beforeAll(async () => {
    // Login as Admin
    const adminLogin = await request(app).post("/api/auth/login")
      .send({ email: "admin@example.com", password: "admin123" });
    adminToken = adminLogin.body.token;

    // Login as Student
    const studentLogin = await request(app).post("/api/auth/login")
      .send({ email: "student@example.com", password: "student123" });
    studentToken = studentLogin.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should allow admin to access users list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it("should forbid student from accessing users list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });
});
