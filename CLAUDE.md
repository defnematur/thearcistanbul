 # Project: Editorial Blog Website

A bilingual (Turkish / English) editorial blog with a museum-website aesthetic. Public-facing reading experience with a small admin interface for two editors. Each blog post can carry a curated Spotify embed. No e-commerce in v1.

---

## 1. Vibe & Design Direction

The reference site (a Divi WordPress florist site) sets the structural pattern — Home, About, Services-equivalent, Gallery, Blog, Contact — but the visual language is the opposite. We want **museum website meets Apple product page**:

- Editorial typography (serif display + clean sans body), generous whitespace, asymmetric grids, hairline rules instead of heavy borders.
- Mostly **off-white / cream backgrounds** with near-black foreground; no saturated brand colors.
- Slow, considered interactions. Subtle fade-and-shift on scroll. No carousel UIs, no parallax, no popups.
- Image-forward. Photography gets room to breathe (large margins around it).
- Reference vibes: MoMA.org, Tate.org.uk, Apple Newsroom, Dia Art Foundation, The Modern House (modernhouse.com), MUBI.

### 1.0 Reference Images (read first)

**Before implementing any UI, read the screenshots in `/vision/`.** This folder contains the visual references the user provided — screenshots from the source WordPress florist site (thearcistanbul.com) showing the page-by-page structure they want to keep, plus any additional inspiration images they add.

How to use them:

- **Take the structure / page layout / section ordering from these images.** Hero → About excerpt → "Behind the Scenes" feature row → recent posts → footer is roughly the home flow. Blog index lists post cards; blog detail is long-form. Contact has address + form + image. Etc.
- **Do NOT take the visual style from these images.** The reference is a generic Divi/WordPress florist theme — beige boxes, rounded green buttons, oversized headings, stock-photo cards, WordPress admin bar visible at the top. Everything visual must be replaced with the museum/Apple direction described in sections 1.1–1.5 of this document.
- **Translate, don't copy.** A "Behind the Scenes" three-icon feature row in the reference becomes a hairline-divided three-column block with restrained typography in our version. A green pill-shaped button becomes a thin underline-on-hover text link or a slim outlined button. Hero photography stays but gets generous margins, no overlay text on top of busy images, and editorial framing.
- **Ignore everything that's WordPress chrome.** The admin bar, "Edit With Divi" buttons, "Sayfayı düzenle" toolbar, the "natro" branding — none of that is part of the design.
- **The footer is the most directly translatable section.** Four columns (brand / quick links / policies / contact). Keep the structure; replace the visual styling with hairline rules and our typography tokens. Drop the social icon coloring; use monoline icons in `--fg`.

If the user adds more images to `/vision/` (e.g. museum site screenshots, typography references, color palette swatches), treat those as additive style guidance — they override the WordPress reference for visual direction.

### 1.1 Typography

Pair a high-contrast variable serif with a neutral grotesque sans.

- **Display / Headings:** `Fraunces` (variable serif, free via Google Fonts). Use the high-contrast optical size for hero typography. Alt: EB Garamond, Cormorant Garamond.
- **Body / UI:** `Geist` (Vercel's own font, free) or `Inter`. Geist pairs naturally with the Vercel stack.
- Load via `next/font/google` (or `next/font/local` for Geist) — no external font CDN calls at runtime.
- Avoid bold weights on body copy. Headings can use weights 400–600; rely on size and tracking for hierarchy.

Type scale (desktop):

| Token | Size | Line height | Tracking | Usage |
|---|---|---|---|---|
| display | 72–96px | 0.95 | -0.02em | Hero, blog post title |
| h1 | 48px | 1.05 | -0.015em | Section openers |
| h2 | 32px | 1.15 | -0.01em | Subsections |
| h3 | 22px | 1.25 | 0 | Card titles |
| body | 17px | 1.6 | 0 | Article copy |
| small | 14px | 1.5 | 0.01em | Captions, meta |

Mobile scales: display → 44px, h1 → 32px, h2 → 24px, body → 16px.

### 1.2 Color Tokens

Define in `tailwind.config.ts` and as CSS variables:

```
--bg:            #FAFAF7   (warm off-white / cream)
--bg-elevated:   #FFFFFF   (cards, modals)
--fg:            #0A0A0A   (near-black, not pure #000)
--fg-muted:      #6B6B6B   (captions, metadata)
--rule:          #E6E3DC   (hairline dividers)
--accent:        #8B7355   (sparingly: links on hover, focus rings)
--accent-soft:   #EFEBE2   (callout backgrounds)
--danger:        #B23A3A   (form errors only)
```

No gradients. No drop shadows except on modal/hover at very low opacity (e.g. `0 1px 2px rgba(0,0,0,0.04)`).

### 1.3 Layout & Spacing

- 12-column grid, 24px gutter desktop / 16px mobile.
- Max content widths: text content 720px, image+text 960px, gallery/grid 1280px.
- Section vertical padding: 160px desktop, 80px mobile.
- Hairline `--rule` for dividers; never `border: 1px solid #ccc`.
- Page transitions: none (full reload feel) or subtle fade (150ms ease).

### 1.4 Imagery

- Use `next/image` everywhere with `priority` only on above-the-fold hero images.
- Default ratio for editorial: 4:5 portrait or 3:2 landscape. Avoid 16:9 (too cinematic, too web-app).
- Lazy load below the fold. Blur placeholder on every image (`placeholder="blur"`).

### 1.5 Motion

- All animations 150–300ms, easing `cubic-bezier(0.22, 1, 0.36, 1)` (gentle out).
- Reveal-on-scroll: opacity 0→1 + translateY 12px → 0. Disable when `prefers-reduced-motion`.
- Hover: underline-on-hover for links (animated from left); 1.02 scale on image cards (300ms).

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC, Server Actions) | Strict mode on |
| Hosting | **Vercel** | Production + Preview deployments per branch |
| Database | **Neon (Postgres)** | Vercel Neon integration; serverless driver `@neondatabase/serverless` |
| ORM | **Drizzle ORM** | Type-safe, lightweight, plays well with Neon edge runtime |
| Storage | **Vercel Blob** | For uploaded images. Do not store images in Neon |
| Auth | **Auth.js v5 (NextAuth.js)** | Credentials provider for 2 admins; JWT sessions |
| i18n | **next-intl** | Subpath routing: `/tr/...`, `/en/...` |
| Styling | **Tailwind CSS** + CSS variables | tokens in `app/globals.css` |
| Admin UI components | **shadcn/ui** | Internal only; keep public site custom |
| Forms / validation | **Zod** + **react-hook-form** | Server-side validation on every Server Action |
| Rich content | **Markdown** (MDX) | Safer than HTML/rich-text; rendered with `next-mdx-remote` |
| Image processing | Built-in `next/image` | Plus Vercel image optimization |
| Rate limiting | **Upstash Ratelimit** | For admin login attempts |
| Email (contact form) | **Resend** | Optional v1; can be a `mailto:` link instead |

### 2.1 Repo Structure

```
/
├── app/
│   ├── [locale]/                    # i18n routing root
│   │   ├── (public)/
│   │   │   ├── page.tsx             # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx         # Blog index
│   │   │   │   └── [slug]/page.tsx  # Blog detail
│   │   │   └── contact/page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx               # Auth-gated layout
│   │   ├── page.tsx                 # Dashboard
│   │   └── posts/
│   │       ├── page.tsx             # List
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── public/                      # Header, footer, blog card, etc.
│   ├── admin/                       # Editor, post form, etc.
│   └── ui/                          # shadcn primitives
├── lib/
│   ├── db/                          # Drizzle schema, queries, client
│   ├── auth.ts                      # Auth.js config
│   ├── i18n.ts                      # next-intl config
│   ├── spotify.ts                   # URL parsing + embed helpers
│   └── validators.ts                # Zod schemas
├── messages/
│   ├── tr.json                      # UI strings
│   └── en.json
├── middleware.ts                    # i18n + admin auth gate
└── drizzle/                         # migrations
```

---

## 3. Pages & Routes

### 3.1 Public

| Route (TR) | Route (EN) | Purpose |
|---|---|---|
| `/tr` | `/en` | Home — hero, recent posts, intro |
| `/tr/hakkinda` | `/en/about` | About page |
| `/tr/blog` | `/en/blog` | Blog index, reverse-chronological |
| `/tr/blog/[slug]` | `/en/blog/[slug]` | Blog post detail with Spotify embed |
| `/tr/iletisim` | `/en/contact` | Contact form / info |

Note on slugs: routes use locale-specific path segments (`hakkinda` vs `about`). Use next-intl's `pathnames` config. Blog post **slugs themselves are language-specific** (`/tr/blog/sergi-acilisi` and `/en/blog/exhibition-opening` are the same post). Each post has both `slug_tr` and `slug_en` in the database.

### 3.2 Admin

| Route | Purpose |
|---|---|
| `/admin/login` | Email/password login (no locale prefix) |
| `/admin` | Dashboard: recent posts, quick stats |
| `/admin/posts` | List all posts (drafts + published) |
| `/admin/posts/new` | Create post |
| `/admin/posts/[id]/edit` | Edit post |

Admin is intentionally English-only — there are only two admins and bilingual UI for them adds maintenance burden with no user value.

### 3.3 Language Toggle

- Persistent toggle in the header: `TR / EN` (current locale styled differently).
- Toggling switches the URL to the equivalent localized path on the same page. Use next-intl's `useRouter` + `usePathname` for this.
- Default locale: **Turkish.** Root `/` redirects to `/tr`. (Confirm before implementing.)
- Locale preference persisted in a `NEXT_LOCALE` cookie. Honor `Accept-Language` on first visit.

---

## 4. Blog Feature

### 4.1 Post Model

Each post has:

- `id` (uuid)
- `slug_tr`, `slug_en` (text, unique per locale)
- `title_tr`, `title_en` (text)
- `excerpt_tr`, `excerpt_en` (text, 160 chars max — used for cards and meta description)
- `content_tr`, `content_en` (markdown / MDX text)
- `cover_image_url` (text — Vercel Blob URL)
- `cover_image_alt_tr`, `cover_image_alt_en` (text)
- `spotify_url` (text, nullable — full Spotify URL: track / album / playlist)
- `status` (enum: `draft`, `published`)
- `published_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)
- `author_id` (uuid, FK → users)

### 4.2 Markdown Capabilities

Posts are authored in **Markdown** (rendered with `next-mdx-remote`), not a rich-text editor, because:

- Markdown is portable and survives platform changes.
- It dramatically reduces XSS attack surface vs. storing raw HTML.
- Easier to handle bilingual content (two text fields, not two HTML trees).

Allowed markdown features:

- Standard formatting (bold, italic, links, lists, blockquotes, headings)
- Images (admin uploads → Markdown gets the Vercel Blob URL)
- Code blocks (rare for this audience, but free)
- Custom MDX components for embeds: `<Figure>`, `<Gallery>`, `<Pullquote>`

Do **not** allow raw HTML in markdown (`rehype-raw` off). All MDX components are explicitly registered.

### 4.3 Spotify Integration

- Admin pastes any Spotify share URL into a `spotify_url` field. Examples accepted:
  - `https://open.spotify.com/track/...`
  - `https://open.spotify.com/album/...`
  - `https://open.spotify.com/playlist/...`
- On render, transform the URL to an embed iframe:
  - `https://open.spotify.com/embed/track/<ID>` (height 152px compact, 352px with cover art)
- The embed sits **at the top of the blog post**, below the title block and cover image. It's framed in a thin border, full content-width.
- Use a server component to validate and parse the URL before rendering. Reject invalid URLs gracefully (just don't render the embed; don't error the page).
- No Spotify API key needed for embeds — they're public.
- CSP must allow `open.spotify.com` in `frame-src` and `script-src`.

Validation regex (Zod):

```ts
const SPOTIFY_URL = /^https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/[a-zA-Z0-9]+(\?.*)?$/;
```

### 4.4 Bilingual Content Rules

- A post must have at minimum a title and content in **one** language to be saved as a draft.
- A post must have **both** language versions complete to be published.
- If a published post lacks a translation in the viewer's locale, show a polite fallback: "This post isn't available in [language] yet. [View in other language]."
- Never auto-translate. Never machine-fill missing translations.

---

## 5. Admin Interface

### 5.1 Authentication

- Auth.js v5 with **Credentials provider** (email + password).
- Passwords hashed with bcrypt (12 rounds minimum).
- Sessions: JWT, 7-day expiry, sliding refresh.
- No self-signup. The two admin accounts are seeded manually via a one-time migration script.
- `/admin/login` is the only unauthenticated admin route. All other `/admin/*` routes redirect to login if no valid session.
- Logout button visible in admin layout header.

### 5.2 Post Editor

A single form with:

- **Locale tabs** at the top: `Turkish | English`. Each tab contains: title, slug (auto-generated from title, editable), excerpt, content (markdown editor with live preview).
- **Cover image:** upload widget → Vercel Blob. Shows preview. Alt text fields for both locales.
- **Spotify URL:** single field, with live embed preview below if URL is valid.
- **Status:** Draft / Published toggle.
- **Publish date:** datetime picker (defaults to now on first publish).
- **Save** (saves as current status), **Publish** (sets status to published + sets `published_at`), **Delete** (soft-delete: set `deleted_at`, hide from listings but keep row).

Markdown editor: lightweight (e.g. `react-md-editor` or `@uiw/react-md-editor`) with side-by-side preview. Do not use Tiptap or other rich-text editors — they encourage HTML drift.

### 5.3 Image Uploads

- Server Action receives the file, validates MIME type (`image/jpeg`, `image/png`, `image/webp`, `image/avif`), validates size (max 8 MB), uploads to Vercel Blob, returns the URL.
- Strip EXIF metadata before storing (use `sharp` server-side).
- Generate a stable, unguessable filename: `{uuid}.{ext}`.
- Store the returned URL in the post's `cover_image_url` or insert into markdown content.

---

## 6. Database Schema

Drizzle schema in `lib/db/schema.ts`:

```ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slugTr: text("slug_tr").notNull().unique(),
  slugEn: text("slug_en").notNull().unique(),
  titleTr: text("title_tr").notNull(),
  titleEn: text("title_en").notNull(),
  excerptTr: text("excerpt_tr"),
  excerptEn: text("excerpt_en"),
  contentTr: text("content_tr").notNull(),
  contentEn: text("content_en").notNull(),
  coverImageUrl: text("cover_image_url"),
  coverImageAltTr: text("cover_image_alt_tr"),
  coverImageAltEn: text("cover_image_alt_en"),
  spotifyUrl: text("spotify_url"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  ip: text("ip").notNull(),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});
```

Indexes:

- `posts(status, published_at desc)` for the blog index query
- `posts(slug_tr)` and `posts(slug_en)` are already unique
- `login_attempts(email, attempted_at)` for rate-limit lookups

---

## 7. Security

### 7.1 Auth

- Bcrypt for password hashing (cost 12).
- Sessions in HttpOnly, Secure, SameSite=Lax cookies.
- `AUTH_SECRET` (32+ random bytes) in Vercel env, never in repo.
- No password reset flow in v1 (admins set passwords manually via DB script). If needed later, magic-link via Resend.
- Rate limit `/admin/login`: max 5 attempts per email per 15 minutes; max 20 per IP per 15 minutes. Use Upstash Ratelimit.
- Lockout response is identical to wrong-password response — never confirm whether an email exists.

### 7.2 Middleware

`middleware.ts` does two things:

1. **i18n routing** (next-intl). Rewrites bare `/` and locale-less paths.
2. **Admin gate.** Any `/admin/*` request (except `/admin/login`) checks for a valid session token; redirects to `/admin/login` otherwise. Run on Edge for speed.

### 7.3 Input Validation

Every Server Action validates input with Zod. No exceptions. Reject with field-level errors, never expose raw error messages from the DB.

### 7.4 SQL Injection

Drizzle parameterizes everything by default. Never use `db.execute(sql.raw(...))` with user input. If a raw query is needed, use `sql\`\`` tagged templates.

### 7.5 XSS

- Markdown rendering: `next-mdx-remote` with no `rehype-raw`. Custom MDX components are an explicit allowlist.
- Spotify URL strictly validated (regex + embed-only render) — no arbitrary iframes allowed.
- All user-controlled text in JSX goes through React's default escaping. Never use `dangerouslySetInnerHTML` on post content.
- For OG meta tags (which use raw strings), strip control characters and limit length.

### 7.6 CSRF

- Server Actions use Next.js's built-in CSRF protection (origin check via `Next-Action` header).
- Auth.js sets up CSRF tokens for its routes automatically.

### 7.7 Headers

Set in `next.config.ts`:

```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://open.spotify.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://i.scdn.co",
          "font-src 'self' https://fonts.gstatic.com",
          "frame-src https://open.spotify.com",
          "connect-src 'self' https://*.vercel.app https://*.neon.tech",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ],
  }];
}
```

### 7.8 File Upload

- MIME validated server-side (don't trust extension or client claim).
- Max size 8 MB.
- Strip EXIF via sharp.
- Random filename, not user-controlled.
- Stored in Vercel Blob with private-by-default ACL; public URLs are only generated for the cover-image URL stored in the post.

### 7.9 Secrets

All in Vercel Environment Variables. Required:

- `DATABASE_URL` (Neon connection string)
- `AUTH_SECRET` (32+ bytes random)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate limiting)
- `RESEND_API_KEY` (only if contact form sends email)

Never commit `.env` to repo. `.env.example` (with placeholder values) is fine.

---

## 8. Edge Cases to Handle

- **Slug collisions:** UI auto-generates a slug from title but must check uniqueness before save. Show inline error if taken.
- **Empty/half translations:** post can save as draft with one language complete; publishing requires both.
- **Broken Spotify URL:** validate at save time. If validation fails, show field error; don't allow save. If URL becomes invalid later (Spotify removes content), the embed renders an empty state; the page still works.
- **Image upload failure:** Server Action returns error; UI shows toast; form state preserved.
- **Concurrent edits:** last-write-wins, but check `updated_at` on save and warn user if it changed since they loaded the form.
- **Soft-deleted posts:** `deleted_at IS NOT NULL` posts excluded from all public queries and listed in a separate "Trash" section in admin (out of scope for v1 — just exclude).
- **Locale fallback:** if a published post has only one language, show in admin as "Missing translation" tag; show on public side only in the language it exists in.
- **Very long titles / content:** hard-limit title to 200 chars, excerpt to 300 chars at the DB level. No hard limit on content.
- **404s:** custom Turkish/English 404 page matching site style.
- **Sitemap:** generate from published posts, exclude `/admin/*` and drafts. Robots.txt disallows `/admin/`.
- **Reduced motion:** all reveal animations check `prefers-reduced-motion`.
- **No-JS fallback:** site must read and navigate without JS (RSC handles this); admin requires JS.
- **Empty blog state:** if zero published posts, blog index shows a tasteful empty state, not a blank page.
- **Cover image missing:** post detail page renders without it cleanly (no broken image, no awkward placeholder).
- **First visit, unknown locale:** Accept-Language → Turkish if Turkish in header, else English. Set cookie.

---

## 9. SEO & Meta

- Per-post Open Graph + Twitter Card meta in the route's `generateMetadata`.
- Per-locale canonical URLs.
- `hreflang` link tags on every post connecting TR ↔ EN versions.
- Sitemap at `/sitemap.xml`, regenerated on build + ISR for newly published posts.
- Robots.txt allows `/`, disallows `/admin/`.
- Use semantic HTML: `<article>`, `<header>`, `<time datetime>`, `<figure><figcaption>`.

---

## 10. Performance

- All public pages use Server Components by default; Client Components only where interactivity demands (language toggle, admin forms, markdown editor).
- ISR (`revalidate: 60`) on blog index and post detail pages. Manually revalidate (`revalidatePath`) on publish/edit/delete from admin Server Actions.
- next/image for everything. Hero gets `priority`.
- Fonts via `next/font` with `display: "swap"`.
- Tailwind purge enabled (default in Next.js 15).
- Lighthouse target: 100 / 100 / 100 / 100 on Home and blog detail desktop; ≥95 mobile.

---

## 11. Deployment

- Vercel project, connected to GitHub repo, auto-deploys on push to `main` (Production) and any other branch (Preview).
- Neon integration enabled in Vercel; `DATABASE_URL` injected per-environment (Production / Preview use separate Neon branches).
- Vercel Blob and Upstash KV linked via Vercel marketplace.
- Run `drizzle-kit push` (dev) or `drizzle-kit migrate` (CI) for schema changes.
- One-time admin seed: a script `scripts/seed-admins.ts` that reads admin email/password from env, hashes, and inserts into `users`. Run once after first migration.

---

## 12. Open Decisions (confirm before implementing)

These are sensible defaults the spec assumes. If any are wrong, override here:

1. **Default locale: Turkish.** `/` redirects to `/tr`. Override if English should be default.
2. **Content authoring: Markdown.** Not a rich-text editor. Override if WYSIWYG is required (security and portability cost goes up).
3. **No comments on blog posts in v1.** Add later if needed.
4. **No contact form email backend in v1.** Contact page can be info-only (address, mailto link) until Resend is wired up.
5. **No e-commerce, no shop, no cart.** (Confirmed.)
6. **Admin UI is English-only.** Two admins, no value in localizing it.
7. **Image storage: Vercel Blob.** Not Neon, not S3.
8. **Auth: Credentials (email/password).** No Google OAuth. Two seeded accounts.

---

## 13. Out of Scope for v1

- Comments / replies on posts
- Search across posts (add later with simple Postgres full-text or Algolia)
- Newsletter signup integration
- E-commerce / shop / cart / checkout
- User accounts for readers
- Multi-author editorial workflow (drafts → review → publish chain) — v1 is "save and publish"
- Image gallery as a standalone page (Gallery shown in reference site)
- Mobile app

---

## 14. Style References

**First reference: `/vision/` folder in the repo.** Read everything in there before starting on UI. See section 1.0 for how to interpret those images (structure yes, visual style no).

When in doubt about visual decisions beyond what `/vision/` shows, look at:

- moma.org — typography pairing, image-forward layouts
- tate.org.uk — editorial restraint, hairline rules
- apple.com/newsroom — clean cards, generous whitespace, motion restraint
- modernhouse.com — serif headings + sans body, asymmetric grids
- mubi.com — black/cream palette, slow reveals, photo-led
- diaart.org — minimal navigation, museum-grade typography

Don't reference Awwwards-style maximalist designs, gradient-heavy SaaS landing pages, or anything with hero video loops. The vibe is "considered editorial," not "show off." 