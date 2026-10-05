import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedDatabase } from "../src/scripts/seed.js";

describe("Book Duplicate Detection & Management", () => {
  let adminToken: string;

  beforeAll(async () => {
    await connectDatabase();
    await seedDatabase();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@libsync.edu", password: "demo123" });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("POST /api/books/check-duplicate - detects duplicate by exact ISBN", async () => {
    const res = await request(app)
      .post("/api/books/check-duplicate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isbn: "978-0072465631", // Database Management Systems
        title: "Random Title",
        author: "Unknown Author",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(true);
    expect(res.body.matchReason).toContain("ISBN");
    expect(res.body.existingBook).toBeDefined();
  });

  it("POST /api/books/check-duplicate - detects duplicate by Title + Author match", async () => {
    const res = await request(app)
      .post("/api/books/check-duplicate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isbn: "978-9999999999",
        title: "Database Management Systems",
        author: "Raghu Ramakrishnan",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(true);
    expect(res.body.existingBook.title).toContain("Database Management Systems");
  });

  it("POST /api/books/check-duplicate - ignores self when excludeBookId provided", async () => {
    const booksRes = await request(app)
      .get("/api/books")
      .set("Authorization", `Bearer ${adminToken}`);
    const existingBook = booksRes.body.items[0];

    const res = await request(app)
      .post("/api/books/check-duplicate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        isbn: existingBook.isbn,
        title: existingBook.title,
        author: existingBook.author,
        excludeBookId: existingBook.id || existingBook._id,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(false);
  });
});
