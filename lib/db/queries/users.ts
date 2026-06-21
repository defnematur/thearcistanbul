import "server-only";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../client";

export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Constant-time-ish: still run a compare so timing doesn't leak existence.
    await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinva.");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function createUser(args: { email: string; password: string; name: string }) {
  const passwordHash = await bcrypt.hash(args.password, 12);
  const [row] = await db
    .insert(schema.users)
    .values({ email: args.email.toLowerCase(), passwordHash, name: args.name })
    .returning();
  return row;
}
