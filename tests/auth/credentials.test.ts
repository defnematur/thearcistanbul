import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/queries/users", () => ({
  verifyCredentials: vi.fn(),
}));
vi.mock("@/lib/db/queries/loginAttempts", () => ({
  recordAttempt: vi.fn(),
  recentFailureCount: vi.fn().mockResolvedValue({ email: 0, ip: 0 }),
}));
vi.mock("@/lib/rate-limit", () => ({
  loginEmailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  loginIpLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
}));

import { authorizeCredentials } from "@/lib/auth-credentials";
import { verifyCredentials } from "@/lib/db/queries/users";

describe("authorizeCredentials", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid input", async () => {
    expect(await authorizeCredentials({ email: "nope", password: "x" })).toBeNull();
  });

  it("returns user on valid credentials", async () => {
    vi.mocked(verifyCredentials).mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      name: "A",
      passwordHash: "x",
      createdAt: new Date(),
    });
    const out = await authorizeCredentials({
      email: "a@b.com",
      password: "longenoughpassword",
      ip: "127.0.0.1",
    });
    expect(out).toEqual({ id: "u1", email: "a@b.com", name: "A" });
  });

  it("returns null on bad credentials", async () => {
    vi.mocked(verifyCredentials).mockResolvedValue(null);
    const out = await authorizeCredentials({
      email: "a@b.com",
      password: "longenoughpassword",
      ip: "127.0.0.1",
    });
    expect(out).toBeNull();
  });
});
