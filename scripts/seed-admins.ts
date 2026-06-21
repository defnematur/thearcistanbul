import { db, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

type SeedRecord = { email: string; password: string; name: string };

function readSeeds(): SeedRecord[] {
  const raw = process.env.ADMIN_SEED;
  if (!raw) {
    throw new Error(
      'ADMIN_SEED must be JSON: [{"email":"a@x.com","password":"...","name":"A"}]',
    );
  }
  const parsed = JSON.parse(raw) as SeedRecord[];
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("ADMIN_SEED is empty");
  return parsed;
}

async function main() {
  const seeds = readSeeds();
  for (const seed of seeds) {
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, seed.email.toLowerCase()))
      .limit(1);
    if (existing.length) {
      console.log(`skip (exists): ${seed.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(seed.password, 12);
    await db.insert(schema.users).values({
      email: seed.email.toLowerCase(),
      passwordHash,
      name: seed.name,
    });
    console.log(`seeded: ${seed.email}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
