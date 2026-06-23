import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("./config/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    JWT_SECRET: "test-secret-with-enough-length",
    JWT_EXPIRES_IN: "1h",
    CORS_ORIGIN: "http://localhost:5173",
    PORT: 4000,
    NODE_ENV: "test"
  }
}));

vi.mock("./lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    $disconnect: vi.fn()
  }
}));

describe("app", () => {
  it("serves health checks", async () => {
    const { createApp } = await import("./app");
    const response = await request(createApp()).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
