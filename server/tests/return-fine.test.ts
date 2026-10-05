import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedDatabase } from "../src/scripts/seed.js";
import { BorrowTransaction } from "../src/models/BorrowTransaction.js";

describe("Returns, Condition Assessment & Fines", () => {
  let librarianToken: string;

  beforeAll(async () => {
    await connectDatabase();
    await seedDatabase();

    const librarianLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "librarian@libsync.edu", password: "demo123" });
    librarianToken = librarianLogin.body.token;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("GET /api/returns/active-loans - lists active loans eligible for return", async () => {
    const res = await request(app)
      .get("/api/returns/active-loans")
      .set("Authorization", `Bearer ${librarianToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.loans)).toBe(true);
    expect(res.body.loans.length).toBeGreaterThan(0);
  });

  it("POST /api/returns - processes return with condition damage fine", async () => {
    const activeLoan = await BorrowTransaction.findOne({ status: "issued" });
    expect(activeLoan).toBeDefined();
    if (!activeLoan) return;

    const res = await request(app)
      .post("/api/returns")
      .set("Authorization", `Bearer ${librarianToken}`)
      .send({
        borrowId: activeLoan._id.toString(),
        condition: "Damaged",
        conditionNotes: "Torn binding and marked pages",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.borrowRecord.status).toBe("returned");
    expect(res.body.borrowRecord.returnCondition).toBe("Damaged");
    // Damaged condition incurs a condition fine of 250
    expect(res.body.fineAmount).toBeGreaterThanOrEqual(250);
  });
});
