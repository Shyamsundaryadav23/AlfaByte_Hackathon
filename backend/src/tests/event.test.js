import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Event APIs", () => {
  let organizerToken;
  let eventId;

  beforeAll(async () => {
    // Login as Organizer
    const res = await request(app).post("/api/auth/login")
      .send({ email: "organizer@example.com", password: "organizer123" });
    organizerToken = res.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("should create a new event", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Test Event",
        description: "Testing Event",
        event_type: "Workshop",
        start_time: "2026-02-10T10:00:00Z",
        end_time: "2026-02-10T12:00:00Z"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    eventId = res.body.id;
  });

  it("should update event status", async () => {
    const res = await request(app)
      .put("/api/events/status")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ eventId, status: "Live" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Live");
  });

  it("should fetch all events", async () => {
    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
