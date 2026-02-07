import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Auth API Tests", () => {
  let token;

  afterAll(async () => {
    await pool.end();
  });

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        role: "Student"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "password123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should reject invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@example.com", password: "123" });
    expect(res.statusCode).toBe(401);
  });
});
