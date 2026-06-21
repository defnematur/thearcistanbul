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
  (t) => [
    uniqueIndex("posts_slug_tr_uq").on(t.slugTr),
    uniqueIndex("posts_slug_en_uq").on(t.slugEn),
    index("posts_status_published_at_idx").on(t.status, t.publishedAt),
    index("posts_not_deleted_idx")
      .on(t.publishedAt)
      .where(sql`deleted_at IS NULL`),
  ],
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
  (t) => [
    index("login_attempts_email_attempted_at_idx").on(t.email, t.attemptedAt),
    index("login_attempts_ip_attempted_at_idx").on(t.ip, t.attemptedAt),
  ],
);
