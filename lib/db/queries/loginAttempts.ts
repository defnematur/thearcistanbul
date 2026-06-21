import "server-only";
import { and, eq, gte, count } from "drizzle-orm";
import { db, schema } from "../client";

export async function recordAttempt(email: string, ip: string, success: boolean) {
  await db.insert(schema.loginAttempts).values({
    email: email.toLowerCase(),
    ip,
    success,
  });
}

export async function recentFailureCount(email: string, ip: string, sinceMinutes = 15) {
  const since = new Date(Date.now() - sinceMinutes * 60_000);
  const [emailCount] = await db
    .select({ n: count() })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.email, email.toLowerCase()),
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.attemptedAt, since),
      ),
    );
  const [ipCount] = await db
    .select({ n: count() })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.ip, ip),
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.attemptedAt, since),
      ),
    );
  return { email: emailCount?.n ?? 0, ip: ipCount?.n ?? 0 };
}
