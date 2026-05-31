# Public UI Design — Home, About, Contact (+ placeholder Journal)

**Date:** 2026-05-31
**Status:** Approved (design directions confirmed via visual brainstorming)

## Goal

Build the public-facing UI so the site can be *seen* before the data/auth layers
exist. This is an **editorial design / article-sharing publication** — not the
florist site the `/vision/` screenshots come from. Articles (writing) are the
center of gravity. All copy is placeholder; admins replace it once live.

Translate the *structure* of the `/vision/` references into the museum / Apple-
product-page aesthetic already defined in CLAUDE.md §1 and implemented as tokens
in `app/globals.css`. Take structure from the references, not visual style.

## Scope

In this pass:

- **Home** (`/[locale]`) — full, article-led
- **About** (`/[locale]/about` · `/tr/hakkinda`)
- **Contact** (`/[locale]/contact` · `/tr/iletisim`) — form UI + validation
- **Journal index** (`/[locale]/blog`) — **placeholder** list using hardcoded
  sample articles, so nav ("Journal") and the home "All writing →" link resolve.
  Real data + blog detail come in Plan 4 (needs the DB from Plan 2).

Out of scope here: blog detail pages, real post data, auth/admin, SEO metadata
(Plan 6), gallery/shop.

## Design Language (already in code)

Cream `#FAFAF7` ground, near-black `#0A0A0A` ink, hairline rules `#E6E3DC`,
muted meta `#6B6B6B`, taupe accent `#8B7355` used sparingly. Fraunces (serif
display) + Geist (sans body). Generous whitespace, no shadows, no saturated
color. Reveal-on-scroll fades (already built as `Reveal`, respects reduced
motion). Tokens/utilities (`text-display`, `max-w-prose|editorial|gallery`,
`bg-bg`, `text-fg-muted`, `border-rule`, `ease-editorial`) exist from Plan 1.

## Approved Page Designs

### Home — "Statement + card grid" (Direction B), all sections kept

Top to bottom, inside the existing `[locale]` layout (Header above, Footer below):

1. **Statement hero** — eyebrow (`Editorial Journal`), large serif voice
   statement (`max-w-[~20ch]`, `text-display`), one muted subline. No hero image.
2. **Recent writing** — section eyebrow + an `All writing →` link (to Journal);
   a 3-column grid of article cards. Each card: 3:2 image (placeholder
   `bg-accent-soft`), a category tag (hairline pill, accent text), serif title,
   date. On `<768px` the grid collapses to 1 column.
3. **"How an issue comes together"** — restrained editorial 3-up (the museum
   translation of the florist "Behind the Scenes" row): eyebrow + three numbered
   items (01/02/03), each a serif sub-title + muted line. Hairline top border.
4. **About teaser** — eyebrow + one serif line + `Read more →` link to About.
5. Footer (existing 4-column hairline footer).

Sections separated by `border-rule` hairlines and section padding
(160px desktop / 80px mobile, per CLAUDE.md §1.3).

### About — "Stacked" (Direction B)

`prose`-width intro (eyebrow + `text-display` title + lede) → full-width
`editorial`-width landscape image (placeholder) → `prose`-width body
(two paragraphs). Calm, gallery-like; image gets full breadth. Reveal on the
body block.

### Contact — "Centered single column" (Direction B)

One narrow centered column (`max-w` ~ prose/`460–520px`): eyebrow + serif title +
lede, then the form, then a single address/email line below
(`İstanbul, Türkiye · hello@thearcistanbul.com`).

Form fields: **Name · Email · Subject · Message**, hairline-underline inputs
(no boxes; `border-b border-rule`, `focus:border-fg`), slim outlined "Send"
button (`border border-fg`, hover fills `bg-fg text-bg`). Includes a hidden
honeypot field.

### Journal index (placeholder)

Reverse-chronological list of sample articles rendered as hairline-divided rows
(date · serif title · category), `editorial` width. Empty-state ready. Clearly
fed by a local placeholder array; swapped for a DB query in Plan 4.

## Components

Reuse: `Container`, `Reveal`, `Header`, `Footer` (Plan 1).

New (in `components/public/`):

- `StatementHero` — eyebrow, title, subline.
- `ArticleCard` — image + tag + title + date; links to `/blog/[slug]`.
- `ArticleGrid` — section wrapper: eyebrow + "All writing →" + responsive grid of `ArticleCard`.
- `EditorialThreeUp` — eyebrow + three numbered items (drives section ③).
- `AboutTeaser` — eyebrow + serif line + link.
- `ContactForm` (Client Component) — RHF + Zod, hairline inputs, honeypot, status messages.
- `AddressBlock` — brand + city/country + email.
- `JournalList` + `JournalRow` — placeholder index list.

Sample data: `lib/placeholder/articles.ts` — a typed array of ~4–6 art/design
articles (slug, title TR/EN, excerpt, category, date, image). One source feeds
the home grid and the Journal index until Plan 4.

## Contact Form Behavior (dependency-aware)

Plan 2 (DB, auth, Upstash rate-limit) and Resend wiring are **not yet built**.
For this UI-first pass:

- Full **client-side** validation (RHF + Zod) and inline field errors.
- A Server Action `submitContact` validates **server-side** with the same Zod
  schema and honors the honeypot.
- Email send via **Resend is guarded**: if `RESEND_API_KEY` + `CONTACT_TO_EMAIL`
  are set, send; otherwise return `ok` and `console.info` the message (dev), so
  the form works end-to-end visually without secrets.
- **Rate limiting is deferred to Plan 2** (noted as a TODO in the action). No
  Upstash dependency added now.

This keeps the UI self-contained while leaving a clean seam for Plan 2/3 to wire
real email + rate limiting.

## i18n

Extend `messages/tr.json` / `messages/en.json` with `home`, `about`, `contact`,
and `journal` sections (placeholder editorial copy, mirrored in both locales).
Localized pathnames (`/hakkinda`, `/iletisim`) already configured in Plan 1.

## Testing

- Unit (Vitest): `ArticleCard` renders title/tag/date and links to the slug;
  `ContactForm` shows inline validation errors and calls the action on valid
  input (action mocked).
- Server Action (Vitest): `submitContact` rejects invalid input, blocks the
  honeypot, returns `ok` when Resend env is absent (guarded path).
- E2E (Playwright): Home renders hero + recent-writing grid on `/tr` and `/en`;
  About and Contact reachable via nav and localized paths; "All writing →"
  reaches the Journal index.

## Done When

- `/tr` and `/en` Home render all four sections + footer, article-led.
- About and Contact render in both locales via localized paths.
- Journal index renders placeholder article rows; home grid + index share one
  placeholder source.
- Contact form validates client + server side; works visually without secrets.
- `pnpm test`, `pnpm test:e2e`, `tsc`, `lint`, and `pnpm build` all pass.
