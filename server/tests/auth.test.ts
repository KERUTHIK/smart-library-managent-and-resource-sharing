import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { User } from "../src/models/User.js";
import { seedDatabase } from "../src/scripts/seed.js";

describe("Authentication & RBAC Endpoints", () => {
  beforeAll(async () => {
    await connectDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("POST /api/auth/login - should authenticate admin successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@libsync.edu", password: "demo123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("admin");
  });

  it("POST /api/auth/login - should authenticate student successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@libsync.edu", password: "demo123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("student");
    expect(res.body.user.name).toBe("Arun Kumar");
  });

  it("POST /api/auth/login - should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@libsync.edu", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/me - should return logged in profile with valid token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@libsync.edu", password: "demo123" });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe("student@libsync.edu");
  });
});
