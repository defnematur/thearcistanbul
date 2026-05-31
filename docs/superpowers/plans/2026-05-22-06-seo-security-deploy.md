# SEO, Security & Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the site to production. Security headers (incl. CSP that permits Spotify embeds), per-locale Open Graph + Twitter Card meta, hreflang link tags TR↔EN, `sitemap.xml`, `robots.txt`, Vercel project config via `vercel.ts`, Neon + Blob + Upstash + Resend env vars wired across Production / Preview / Development, and a Lighthouse audit pass.

**Architecture:** Headers in `next.config.ts`. `generateMetadata` helpers in `lib/seo/metadata.ts`. Sitemap via the new `app/sitemap.ts` Route Handler that pulls published posts. `vercel.ts` (Vercel's TypeScript config) replaces `vercel.json`. Production deploy via Vercel Git integration; manual `vercel link` for CLI access.

**Tech Stack:** Next.js 15 metadata API, `@vercel/config`, Vercel CLI, Lighthouse CI (optional).

**Prerequisites:** Plans 1–5 complete and merged. Vercel project created and linked to the GitHub repo. Neon + Blob + Upstash integrations installed on the Vercel project.

---

## File Structure

**Create:**
- `lib/seo/metadata.ts` — generators for site, blog index, blog post
- `lib/seo/og-image.ts` — `@vercel/og` route (Task 5)
- `app/og/[...slug]/route.tsx` — dynamic OG image route
- `app/sitemap.ts` — sitemap entries
- `app/robots.ts` — robots.txt
- `vercel.ts` — Vercel project config
- `public/og/default.jpg` — fallback OG image
- `tests/seo/metadata.test.ts`

**Modify:**
- `next.config.ts` — headers (CSP, etc.)
- `app/[locale]/layout.tsx` — site-level metadata + viewport
- `app/[locale]/(public)/blog/[slug]/page.tsx` — `generateMetadata` + alternates
- `app/[locale]/(public)/blog/page.tsx` — `generateMetadata`
- `app/[locale]/(public)/about/page.tsx`, `contact/page.tsx`, `page.tsx` — basic metadata
- `app/admin/layout.tsx` — `robots: { index: false, follow: false }`

---

### Task 1: Security headers in `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace the body of `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://open.spotify.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://i.scdn.co",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src https://open.spotify.com",
  "connect-src 'self' https://*.vercel.app https://*.neon.tech https://*.upstash.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default withNextIntl(config);
```

- [ ] **Step 2: Smoke**

`pnpm dev`. Visit `/tr`, open DevTools → Network → Response Headers — confirm CSP and all of the above headers present.

Visit `/tr/blog/<any-published-with-spotify>` — confirm Spotify iframe loads (no CSP block in console).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: security headers with Spotify-aware CSP"
```

---

### Task 2: Robots + Sitemap

**Files:**
- Create: `app/robots.ts`, `app/sitemap.ts`

- [ ] **Step 1: `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thearcistanbul.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

- [ ] **Step 2: `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { listAllPublishedSlugsForSitemap } from "@/lib/db/queries/posts";

const STATIC_PATHS = [
  { tr: "/", en: "/" },
  { tr: "/hakkinda", en: "/about" },
  { tr: "/blog", en: "/blog" },
  { tr: "/iletisim", en: "/contact" },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thearcistanbul.com";
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((p) => [
    {
      url: `${base}/tr${p.tr === "/" ? "" : p.tr}`,
      lastModified: now,
      alternates: { languages: { en: `${base}/en${p.en === "/" ? "" : p.en}`, tr: `${base}/tr${p.tr === "/" ? "" : p.tr}` } },
    },
    {
      url: `${base}/en${p.en === "/" ? "" : p.en}`,
      lastModified: now,
      alternates: { languages: { en: `${base}/en${p.en === "/" ? "" : p.en}`, tr: `${base}/tr${p.tr === "/" ? "" : p.tr}` } },
    },
  ]);

  const posts = await listAllPublishedSlugsForSitemap();
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((p) => [
    {
      url: `${base}/tr/blog/${p.slugTr}`,
      lastModified: p.updatedAt,
      alternates: { languages: { en: `${base}/en/blog/${p.slugEn}`, tr: `${base}/tr/blog/${p.slugTr}` } },
    },
    {
      url: `${base}/en/blog/${p.slugEn}`,
      lastModified: p.updatedAt,
      alternates: { languages: { en: `${base}/en/blog/${p.slugEn}`, tr: `${base}/tr/blog/${p.slugTr}` } },
    },
  ]);

  return [...staticEntries, ...postEntries];
}
```

- [ ] **Step 3: Smoke**

`pnpm dev` → `http://localhost:3000/robots.txt` and `http://localhost:3000/sitemap.xml`. Confirm XML lists known paths and any published posts.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: robots.txt and sitemap with hreflang alternates"
```

---

### Task 3: SEO metadata helpers

**Files:**
- Create: `lib/seo/metadata.ts`, `tests/seo/metadata.test.ts`

- [ ] **Step 1: Failing test `tests/seo/metadata.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { buildPostMetadata, buildSiteMetadata } from "@/lib/seo/metadata";

describe("buildPostMetadata", () => {
  it("includes hreflang alternates", () => {
    const m = buildPostMetadata({
      locale: "tr",
      title: "Merhaba",
      description: "Selam dünya.",
      slugTr: "merhaba",
      slugEn: "hello",
      ogImage: null,
      publishedAt: new Date("2026-01-01T00:00:00Z"),
    });
    expect(m.alternates?.canonical).toBe("https://thearcistanbul.com/tr/blog/merhaba");
    expect(m.alternates?.languages).toMatchObject({
      tr: "https://thearcistanbul.com/tr/blog/merhaba",
      en: "https://thearcistanbul.com/en/blog/hello",
    });
    expect(m.openGraph?.locale).toBe("tr_TR");
  });
});

describe("buildSiteMetadata", () => {
  it("sets title template + default", () => {
    const m = buildSiteMetadata("en");
    expect(m.title).toMatchObject({ default: expect.any(String), template: expect.stringContaining("%s") });
  });
});
```

- [ ] **Step 2: Implement `lib/seo/metadata.ts`**

```ts
import type { Metadata } from "next";

const SITE = "The Arc Istanbul";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thearcistanbul.com";

function localeTag(locale: "tr" | "en") {
  return locale === "tr" ? "tr_TR" : "en_US";
}

export function buildSiteMetadata(locale: "tr" | "en"): Metadata {
  return {
    metadataBase: new URL(BASE),
    title: { default: SITE, template: `%s — ${SITE}` },
    description:
      locale === "tr"
        ? "Çağdaş sanat, tasarım ve müzik üzerine editoryal bir günce."
        : "An editorial journal on contemporary art, design, and music.",
    openGraph: {
      siteName: SITE,
      type: "website",
      locale: localeTag(locale),
      url: `${BASE}/${locale}`,
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        tr: `${BASE}/tr`,
        en: `${BASE}/en`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export function buildPostMetadata(args: {
  locale: "tr" | "en";
  title: string;
  description: string;
  slugTr: string;
  slugEn: string;
  ogImage: string | null;
  publishedAt: Date | null;
}): Metadata {
  const path = args.locale === "tr" ? `/tr/blog/${args.slugTr}` : `/en/blog/${args.slugEn}`;
  const url = `${BASE}${path}`;
  return {
    title: args.title,
    description: args.description.slice(0, 200),
    alternates: {
      canonical: url,
      languages: {
        tr: `${BASE}/tr/blog/${args.slugTr}`,
        en: `${BASE}/en/blog/${args.slugEn}`,
      },
    },
    openGraph: {
      type: "article",
      title: args.title,
      description: args.description.slice(0, 200),
      url,
      locale: localeTag(args.locale),
      publishedTime: args.publishedAt?.toISOString(),
      images: args.ogImage ? [{ url: args.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description.slice(0, 200),
      images: args.ogImage ? [args.ogImage] : undefined,
    },
  };
}
```

- [ ] **Step 3: Test passes**

```bash
pnpm test tests/seo/metadata.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: SEO metadata helpers with hreflang"
```

---

### Task 4: Wire metadata into routes

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/[locale]/(public)/page.tsx`, `about/page.tsx`, `contact/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Site-level metadata**

In `app/[locale]/layout.tsx`, add:

```ts
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: "tr" | "en" }> }) {
  const { locale } = await params;
  return buildSiteMetadata(locale);
}
```

- [ ] **Step 2: Per-page metadata for Home, About, Contact, Blog index**

Each page exports a `generateMetadata` that sets a title and uses `alternates.languages` with the other locale's path. Example for `about/page.tsx`:

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: "tr" | "en" }> }) {
  const { locale } = await params;
  return {
    title: locale === "tr" ? "Hakkımızda" : "About",
    alternates: {
      canonical: locale === "tr"
        ? "https://thearcistanbul.com/tr/hakkinda"
        : "https://thearcistanbul.com/en/about",
      languages: {
        tr: "https://thearcistanbul.com/tr/hakkinda",
        en: "https://thearcistanbul.com/en/about",
      },
    },
  };
}
```

Apply analogous blocks for the other public pages (paths from `lib/i18n/config.ts` `pathnames`). Wrap the literal base URL in `process.env.NEXT_PUBLIC_SITE_URL ?? "https://thearcistanbul.com"` for DRY (extract a helper in `lib/seo/metadata.ts` if it grows).

- [ ] **Step 3: Blog post metadata**

In `app/[locale]/(public)/blog/[slug]/page.tsx`, add:

```ts
import { buildPostMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "tr" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await findPublishedBySlug(locale, slug);
  if (!post) return {};
  return buildPostMetadata({
    locale,
    title: locale === "tr" ? post.titleTr : post.titleEn,
    description: (locale === "tr" ? post.excerptTr : post.excerptEn) ?? "",
    slugTr: post.slugTr,
    slugEn: post.slugEn,
    ogImage: post.coverImageUrl,
    publishedAt: post.publishedAt,
  });
}
```

- [ ] **Step 4: Admin layout `noindex`**

In `app/admin/layout.tsx`, add at module top:

```ts
export const metadata = {
  title: "Admin · The Arc Istanbul",
  robots: { index: false, follow: false, nocache: true },
};
```

- [ ] **Step 5: Smoke**

`pnpm dev`. View source of:
- `/tr` → confirm `<meta property="og:locale" content="tr_TR">`, `<link rel="alternate" hreflang="en">`
- `/en/blog/<slug>` → confirm `og:type=article` and hreflang alternates point to TR slug
- `/admin` → confirm `noindex, nofollow`

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: wire SEO metadata + hreflang across pages"
```

---

### Task 5: Dynamic OG image (optional but recommended)

**Files:**
- Create: `app/[locale]/(public)/blog/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Install**

```bash
pnpm add @vercel/og
```

- [ ] **Step 2: `opengraph-image.tsx`** (replaces `ogImage` from cover when missing)

```tsx
import { ImageResponse } from "next/og";
import { findPublishedBySlug } from "@/lib/db/queries/posts";

export const runtime = "nodejs";
export const alt = "The Arc Istanbul";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: { locale: "tr" | "en"; slug: string };
}) {
  const post = await findPublishedBySlug(params.locale, params.slug);
  const title =
    post && (params.locale === "tr" ? post.titleTr : post.titleEn)
      ? (params.locale === "tr" ? post.titleTr : post.titleEn)
      : "The Arc Istanbul";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 96,
          background: "#FAFAF7",
          color: "#0A0A0A",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#6B6B6B" }}>
          The Arc Istanbul
        </div>
        <div style={{ fontSize: 84, lineHeight: 1.05, marginTop: 24, maxWidth: 1000 }}>{title}</div>
      </div>
    ),
    size,
  );
}
```

This will be discovered automatically by Next.js per-route OG metadata convention; `buildPostMetadata` will *not* override it unless `ogImage` is non-null. To make the dynamic OG always win, drop `images` from `buildPostMetadata` and rely on the file-based convention. Update `buildPostMetadata` to not set `images` and `twitter.images`.

- [ ] **Step 3: Smoke**

Visit `http://localhost:3000/tr/blog/<slug>/opengraph-image` — confirm a 1200×630 PNG renders with the post title.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: dynamic OG image for blog posts"
```

---

### Task 6: `vercel.ts` project config

**Files:**
- Create: `vercel.ts`

- [ ] **Step 1: Install**

```bash
pnpm add -D @vercel/config
```

- [ ] **Step 2: Implement**

```ts
import { type VercelConfig, routes } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
  outputDirectory: ".next",
  redirects: [
    routes.redirect("/admin/", "/admin"),
  ],
  headers: [
    routes.cacheControl("/_next/static/(.*)", {
      public: true,
      maxAge: "1 year",
      immutable: true,
    }),
    routes.cacheControl("/og/(.*)", {
      public: true,
      maxAge: "1 day",
    }),
  ],
};

export default config;
```

- [ ] **Step 3: Remove any `vercel.json`** if one exists. (None expected from prior plans.)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: vercel.ts project config"
```

---

### Task 7: Wire environment variables in Vercel

**Files:**
- None (cloud config)

- [ ] **Step 1: `vercel link`**

```bash
pnpm dlx vercel@latest login
pnpm dlx vercel@latest link
```

Select the project (create if missing).

- [ ] **Step 2: Install Vercel integrations**

In the Vercel dashboard for the linked project:
- Storage → Neon (creates `DATABASE_URL` per environment)
- Storage → Blob (creates `BLOB_READ_WRITE_TOKEN`)
- Storage → Upstash Redis (creates `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

- [ ] **Step 3: Set remaining secrets**

Run these for each value:

```bash
pnpm dlx vercel@latest env add AUTH_SECRET production
pnpm dlx vercel@latest env add AUTH_SECRET preview
pnpm dlx vercel@latest env add AUTH_SECRET development
pnpm dlx vercel@latest env add RESEND_API_KEY production
pnpm dlx vercel@latest env add RESEND_API_KEY preview
pnpm dlx vercel@latest env add CONTACT_TO_EMAIL production
pnpm dlx vercel@latest env add CONTACT_TO_EMAIL preview
pnpm dlx vercel@latest env add NEXT_PUBLIC_SITE_URL production
```

`NEXT_PUBLIC_SITE_URL` = `https://thearcistanbul.com` (or the actual production domain).

- [ ] **Step 4: Pull to local**

```bash
pnpm dlx vercel@latest env pull .env.local
```

- [ ] **Step 5: Verify**

```bash
pnpm dev
```

Confirm `/tr`, `/admin`, etc. all work with the pulled secrets. `pnpm db:studio` still connects.

(No commit — env is server-side only.)

---

### Task 8: First production deploy

- [ ] **Step 1: Push current main branch**

```bash
git push origin main
```

Vercel will auto-deploy on push. Watch the build in the Vercel dashboard.

- [ ] **Step 2: Run migrations against production Neon branch**

```bash
pnpm dlx vercel@latest env pull .env.production --environment=production
pnpm dotenv -e .env.production -- pnpm db:migrate
```

- [ ] **Step 3: Seed production admins**

In `.env.production` (temporarily, do NOT commit), add `ADMIN_SEED=[...]`. Run:

```bash
pnpm dotenv -e .env.production -- pnpm db:seed-admins
```

Then delete the `ADMIN_SEED` line from `.env.production`. Delete `.env.production` after — never commit it.

- [ ] **Step 4: Smoke production**

Visit the production URL:
- Headers: confirm CSP, HSTS, X-Frame-Options
- `/tr` and `/en` render
- `/admin/login` accepts a seeded user → dashboard
- Create a post → published → visible on `/[locale]/blog`
- `sitemap.xml`, `robots.txt` accessible
- View source of a post: `og:image`, hreflang, canonical all correct

- [ ] **Step 5: Map the custom domain**

In Vercel dashboard → Domains → Add `thearcistanbul.com` (and `www`). Wait for DNS / SSL.

---

### Task 9: Lighthouse audit pass

- [ ] **Step 1: Run Lighthouse on Production**

Use Chrome DevTools Lighthouse on:
- `https://thearcistanbul.com/tr` (desktop + mobile)
- `https://thearcistanbul.com/tr/blog`
- `https://thearcistanbul.com/tr/blog/<slug>`

Targets (CLAUDE.md §10): Home + blog detail desktop 100/100/100/100; mobile ≥95.

- [ ] **Step 2: Triage common issues**

If Performance < 95 mobile:
- Confirm cover images use `next/image` with appropriate `sizes`.
- Confirm Fraunces variable font is used with `display: swap`.
- Confirm `priority` only on the visible hero image.
- Check the JS bundle in DevTools → Coverage. The MD editor in admin must not be loaded on public pages (verify via `next/dynamic` chunk split).

If Accessibility < 100:
- Every `<img>` has alt text (even if empty for decorative).
- Hero `<h1>` exists once per page.
- Form fields all have labels.
- Color contrast on `--fg-muted` against `--bg` is ≥ 4.5:1 (current `#6B6B6B` on `#FAFAF7` is ~5.0:1 — passes).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "perf: lighthouse audit pass"
git push
```

---

### Task 10: End-to-end production smoke test

Run all of these against the production URL once domain + DNS are live:

- [ ] **A. Public reading flow**
  1. `/` → redirects to `/tr`.
  2. Language toggle flips to `/en` and back. `<html lang>` updates.
  3. `/tr/blog/<slug>` renders with Spotify embed (if present), MDX body, hreflang link in `<head>`.
  4. Try a post that's only published in TR — visiting `/en/blog/<en-slug>` shows MissingTranslation card with link back to TR.
  5. `/tr/blog?q=<term>` returns ranked search results.

- [ ] **B. Contact form**
  1. Submit with junk → inline errors.
  2. Submit valid → "Your message is on its way" + email lands at `CONTACT_TO_EMAIL`.
  3. Submit 4 times rapidly → rate-limit message appears.

- [ ] **C. Admin flow**
  1. `/admin/login` rejects bad password 5 times → 6th attempt is rate-limited (look identical to wrong password).
  2. Valid login → dashboard.
  3. Create draft → save → reload edit page → state persists.
  4. Upload large (>8MB) image → error message.
  5. Upload valid image → URL appears on form.
  6. Click Publish without one locale filled → `missing_translation` error.
  7. Fill both locales → Publish → post visible publicly within 60s (ISR window) or immediately if `revalidatePath` fired.
  8. Edit published post in two tabs concurrently → second save returns `stale`.
  9. Delete → redirected to `/admin/posts`; post hidden from `/tr/blog`.

- [ ] **D. SEO + security**
  1. `https://securityheaders.com/?q=thearcistanbul.com` → grade A or better.
  2. View source of homepage → all expected meta tags.
  3. Google Rich Results test on a post URL → shows article snippet preview.

- [ ] **E. Performance**
  1. Lighthouse mobile blog detail ≥ 95 across all four axes.
  2. Network throttling "Fast 3G" → LCP < 2.5s on home.

Mark this task complete only when every box above is checked.

---

## Done When

- Production URL serves the site over HTTPS with all security headers
- `sitemap.xml` and `robots.txt` are live and correct
- All public pages have hreflang + canonical + OG + Twitter meta
- Blog post pages have a dynamic OG image
- Admin is `noindex`
- Lighthouse score meets the CLAUDE.md §10 targets
- E2E smoke checklist (Task 10) fully passes