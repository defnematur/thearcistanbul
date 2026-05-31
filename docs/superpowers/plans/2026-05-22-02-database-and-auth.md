# Database & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Neon Postgres database with Drizzle ORM, define the schema (`users`, `posts`, `login_attempts`), wire Auth.js v5 Credentials provider, gate `/admin/*` via middleware, add Upstash login rate limiting, and seed two admin users.

**Architecture:** Drizzle schema + drizzle-kit migrations. Neon serverless driver (`@neondatabase/serverless`) wrapped by a singleton `lib/db/client.ts`. Auth.js v5 with `Credentials` provider, JWT sessions, bcrypt password hashing. Server-side rate limit via `@upstash/ratelimit`. Middleware composed with next-intl: i18n for public routes, session check for `/admin/*`.

**Tech Stack:** Drizzle ORM, drizzle-kit, `@neondatabase/serverless`, Auth.js v5 (`next-auth@5`), bcryptjs, Zod, `@upstash/ratelimit`, `@upstash/redis`.

---

## File Structure

**Create:**
- `lib/db/client.ts` — singleton Neon HTTP client + Drizzle instance
- `lib/db/schema.ts` — table definitions
- `lib/db/queries/users.ts` — user lookup + verify password
- `lib/db/queries/loginAttempts.ts` — record + count failures
- `lib/auth.ts` — Auth.js v5 config (`auth`, `signIn`, `signOut`, `handlers`)
- `lib/rate-limit.ts` — Upstash ratelimit wrapper
- `app/api/auth/[...nextauth]/route.ts` — Auth handlers
- `drizzle.config.ts`
- `scripts/seed-admins.ts` — one-time seed (tsx)
- `tests/db/schema.test.ts`, `tests/auth/credentials.test.ts`

**Modify:**
- `middleware.ts` — compose i18n + admin gate
- `.env.example` — confirm vars
- `package.json` — scripts (`db:generate`, `db:migrate`, `db:seed-admins`)

---

### Task 1: Install dependencies

- [ ] **Step 1: Install**

```bash
pnpm add drizzle-orm @neondatabase/serverless next-auth@beta @auth/drizzle-adapter bcryptjs zod @upstash/ratelimit @upstash/redis
pnpm add -D drizzle-kit @types/bcryptjs tsx dotenv-cli
```

- [ ] **Step 2: Add scripts to `package.json`**

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:seed-admins": "dotenv -e .env.local -- tsx scripts/seed-admins.ts"
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: add db + auth deps"
```

---

### Task 2: Drizzle config + schema

**Files:**
- Create: `drizzle.config.ts`, `lib/db/schema.ts`

- [ ] **Step 1: `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
```

- [ ] **Step 2: `lib/db/schema.ts`**

```ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const postStatus = ["draft", "published"] as const;
export type PostStatus = (typeof postStatus)[number];

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slugTr: varchar("slug_tr", { length: 200 }).notNull(),
    slugEn: varchar("slug_en", { length: 200 }).notNull(),
    titleTr: varchar("title_tr", { length: 200 }).notNull(),
    titleEn: varchar("title_en", { length: 200 }).notNull(),
    excerptTr: varchar("excerpt_tr", { length: 300 }),
    excerptEn: varchar("excerpt_en", { length: 300 }),
    contentTr: text("content_tr").notNull().default(""),
    contentEn: text("content_en").notNull().default(""),
    coverImageUrl: text("cover_image_url"),
    coverImageAltTr: varchar("cover_image_alt_tr", { length: 250 }),
    coverImageAltEn: varchar("cover_image_alt_en", { length: 250 }),
    spotifyUrl: text("spotify_url"),
    status: text("status", { enum: postStatus }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    slugTrUq: uniqueIndex("posts_slug_tr_uq").on(t.slugTr),
    slugEnUq: uniqueIndex("posts_slug_en_uq").on(t.slugEn),
    listIdx: index("posts_status_published_at_idx").on(t.status, t.publishedAt),
    notDeletedListIdx: index("posts_not_deleted_idx")
      .on(t.publishedAt)
      .where(sql`deleted_at IS NULL`),
  }),
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    ip: varchar("ip", { length: 64 }).notNull(),
    success: boolean("success").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("login_attempts_email_attempted_at_idx").on(t.email, t.attemptedAt),
    ipIdx: index("login_attempts_ip_attempted_at_idx").on(t.ip, t.attemptedAt),
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: drizzle schema (users, posts, login_attempts)"
```

---

### Task 3: DB client singleton

**Files:**
- Create: `lib/db/client.ts`

- [ ] **Step 1: Implement**

```ts
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.fetchConnectionCache = true;

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = globalThis.__dbClient ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis.__dbClient = db;
export { schema };
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: neon + drizzle client singleton"
```

---

### Task 4: Generate + apply first migration

**Files:**
- Create: `drizzle/0000_*.sql` (auto-generated)

- [ ] **Step 1: Set DATABASE_URL**

Create a `.env.local` (gitignored) with a working Neon connection string from the Vercel Neon integration:

```
DATABASE_URL=postgres://...
```

- [ ] **Step 2: Generate migration**

```bash
pnpm db:generate
```

Expected: SQL file created under `drizzle/`.

- [ ] **Step 3: Run migration**

```bash
pnpm dotenv -e .env.local -- pnpm db:migrate
```

Expected: tables created. Verify with `pnpm db:studio` and visually confirm 3 tables.

- [ ] **Step 4: Commit**

```bash
git add drizzle/ && git commit -m "db: initial migration"
```

---

### Task 5: User query layer

**Files:**
- Create: `lib/db/queries/users.ts`

- [ ] **Step 1: Implement**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: user query helpers with bcrypt verify"
```

---

### Task 6: Login attempt query layer + rate limiting

**Files:**
- Create: `lib/db/queries/loginAttempts.ts`, `lib/rate-limit.ts`

- [ ] **Step 1: `lib/db/queries/loginAttempts.ts`**

```ts
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
```

- [ ] **Step 2: `lib/rate-limit.ts`**

```ts
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const loginEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "15 m"),
  prefix: "rl:login:email",
});

export const loginIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, "15 m"),
  prefix: "rl:login:ip",
});
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: login attempt tracking + upstash rate limit"
```

---

### Task 7: Auth.js v5 config (Credentials provider)

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`
- Create: `types/next-auth.d.ts`

- [ ] **Step 1: `lib/auth.ts`**

```ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyCredentials } from "@/lib/db/queries/users";
import { recordAttempt, recentFailureCount } from "@/lib/db/queries/loginAttempts";
import { loginEmailLimiter, loginIpLimiter } from "@/lib/rate-limit";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  ip: z.string().default("unknown"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        ip: { type: "text" },
      },
      authorize: async (raw) => {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, ip } = parsed.data;

        const [emailRl, ipRl] = await Promise.all([
          loginEmailLimiter.limit(email.toLowerCase()),
          loginIpLimiter.limit(ip),
        ]);
        if (!emailRl.success || !ipRl.success) {
          await recordAttempt(email, ip, false);
          return null;
        }

        const dbCounts = await recentFailureCount(email, ip);
        if (dbCounts.email >= 5 || dbCounts.ip >= 20) {
          await recordAttempt(email, ip, false);
          return null;
        }

        const user = await verifyCredentials(email, password);
        await recordAttempt(email, ip, !!user);
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid) session.user = { ...session.user, id: token.uid as string };
      return session;
    },
  },
  trustHost: true,
});

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
```

- [ ] **Step 2: `app/api/auth/[...nextauth]/route.ts`**

```ts
export { GET, POST } from "@/lib/auth";

// Re-export handlers from the Auth.js config.
import { handlers } from "@/lib/auth";
export const { GET: AuthGET, POST: AuthPOST } = handlers;
```

Replace the file body with:

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: auth.js v5 credentials provider with rate limiting"
```

---

### Task 8: Compose middleware (i18n + admin gate)

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Replace `middleware.ts`**

```ts
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./lib/i18n/routing";
import { auth } from "./lib/auth";

const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await auth();
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) return NextResponse.next();

  return intl(req);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: compose middleware (i18n + admin auth gate)"
```

---

### Task 9: Admin seed script

**Files:**
- Create: `scripts/seed-admins.ts`

- [ ] **Step 1: Write `scripts/seed-admins.ts`**

```ts
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
```

- [ ] **Step 2: Run once**

Add to `.env.local` (DO NOT COMMIT):

```
ADMIN_SEED=[{"email":"editor1@thearcistanbul.com","password":"REPLACE-WITH-STRONG","name":"Editor One"},{"email":"editor2@thearcistanbul.com","password":"REPLACE-WITH-STRONG","name":"Editor Two"}]
```

Then:

```bash
pnpm db:seed-admins
```

Expected: two `seeded:` log lines. Re-running prints `skip (exists)`.

- [ ] **Step 3: Remove ADMIN_SEED from .env.local after seeding**

Manually delete that line so a credential dump can't replay.

- [ ] **Step 4: Commit (script only — not .env.local)**

```bash
git add scripts/ && git commit -m "feat: admin seed script"
```

---

### Task 10: Schema sanity test (Vitest)

**Files:**
- Create: `tests/db/schema.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { posts, users, postStatus } from "@/lib/db/schema";

describe("schema", () => {
  it("posts has status enum draft|published", () => {
    expect(postStatus).toEqual(["draft", "published"]);
  });

  it("users.email is unique", () => {
    const col = users.email;
    expect(col).toBeDefined();
  });

  it("posts has slug_tr and slug_en columns", () => {
    expect(posts.slugTr).toBeDefined();
    expect(posts.slugEn).toBeDefined();
  });
});
```

- [ ] **Step 2: Run**

```bash
pnpm test tests/db
```

Expected: 3 passed (schema already in place from Task 2).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: schema sanity checks"
```

---

### Task 11: Credentials authorize() unit test

**Files:**
- Create: `tests/auth/credentials.test.ts`

- [ ] **Step 1: Refactor `lib/auth.ts` to export the authorize fn for testing**

In `lib/auth.ts`, extract the body of `authorize` into an exported function:

```ts
export async function authorizeCredentials(raw: unknown) {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return null;
  // ...rest of body...
}
```

Then reference it from the provider: `authorize: authorizeCredentials`.

- [ ] **Step 2: Write `tests/auth/credentials.test.ts`**

```ts
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

import { authorizeCredentials } from "@/lib/auth";
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
```

- [ ] **Step 3: Run**

```bash
pnpm test tests/auth
```

Expected: 3 passed.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test: authorizeCredentials unit tests"
```

---

### Task 12: Add AUTH_SECRET to env

- [ ] **Step 1: Generate**

```bash
openssl rand -base64 32
```

Copy the value into `.env.local`:

```
AUTH_SECRET=<generated value>
```

Add to Vercel project Environment Variables (Production + Preview + Development).

- [ ] **Step 2: Smoke `/admin` redirect**

`pnpm dev` → visit `http://localhost:3000/admin` → expect redirect to `/admin/login`.

(The login page itself is built in Plan 5.)

- [ ] **Step 3: Commit**

(Nothing to commit — env-only step.)

---

## Done When

- `drizzle/0000_*.sql` applied to the dev Neon branch
- `pnpm test` passes (schema + credentials)
- `/admin` redirects to `/admin/login` (which 404s for now — built in Plan 5)
- Two admin users exist in `users` table (verify with `pnpm db:studio`)