import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedDatabase } from "../src/scripts/seed.js";
import { Book } from "../src/models/Book.js";

describe("4-Tier Borrow Request Routing Workflow", () => {
  let studentToken: string;
  let librarianToken: string;
  let sampleBook: any;

  beforeAll(async () => {
    await connectDatabase();
    await seedDatabase();

    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "student@libsync.edu", password: "demo123" });
    studentToken = studentLogin.body.token;

    const librarianLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "librarian@libsync.edu", password: "demo123" });
    librarianToken = librarianLogin.body.token;

    sampleBook = await Book.findOne({ isbn: "978-0072465631" });
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("POST /api/requests - creates a borrow request and evaluates routing tier", async () => {
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        bookId: sampleBook._id.toString(),
        notes: "Need for Databases lab",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.request).toBeDefined();
    // 4-tier routing outcome: auto_approved, pending_transfer, waitlisted, or pending
    expect(["auto_approved", "pending_transfer", "waitlisted", "pending"]).toContain(
      res.body.request.status
    );
  });

  it("GET /api/requests - librarian can list all pending requests", async () => {
    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${librarianToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.requests)).toBe(true);
    expect(res.body.requests.length).toBeGreaterThan(0);
  });
});
