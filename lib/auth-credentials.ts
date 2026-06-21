import { z } from "zod";
import { verifyCredentials } from "@/lib/db/queries/users";
import { recordAttempt, recentFailureCount } from "@/lib/db/queries/loginAttempts";

// The Credentials `authorize` logic lives here, free of any `next-auth` import,
// so it can be unit-tested without loading the Auth.js runtime (which pulls in
// `next/server` and is awkward under Vitest's node environment).
const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  ip: z.string().default("unknown"),
});

export async function authorizeCredentials(raw: unknown) {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { email, password, ip } = parsed.data;

  // Rate limiting is enforced via the Postgres `login_attempts` table: count
  // recent failures per email and per IP over the last 15 minutes.
  const dbCounts = await recentFailureCount(email, ip);
  if (dbCounts.email >= 5 || dbCounts.ip >= 20) {
    await recordAttempt(email, ip, false);
    return null;
  }

  const user = await verifyCredentials(email, password);
  await recordAttempt(email, ip, !!user);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}
