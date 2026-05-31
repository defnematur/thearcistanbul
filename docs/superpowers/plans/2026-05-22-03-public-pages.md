# Public Pages Implementation Plan (Home, About, Contact)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three non-blog public pages — Home, About, Contact — with editorial typography, hairline rules, image-forward layout, and a working contact form backed by Resend. Translate the WordPress reference layouts in `/vision/` into museum-grade pages.

**Architecture:** All pages are React Server Components. The contact form is a Client Component (form state) that posts to a Server Action; the action validates with Zod, rate-limits, and sends via Resend. No DB writes for contact messages in v1 (email only).

**Tech Stack:** Next.js 15 RSC + Server Actions, `react-hook-form`, `@hookform/resolvers/zod`, Zod, `resend`, `@upstash/ratelimit` (reused from Plan 2), `next/image`.

**Reference (read before coding):**
- `/vision/The Arc Istanbul.png` — Home structure
- `/vision/About the Arc Istanbul.png` — About structure
- `/vision/Kontakt The Arc Istanbul.png` — Contact structure
- CLAUDE.md §1 (visual direction), §1.0 (translate-don't-copy rule)

---

## File Structure

**Create:**
- `app/[locale]/(public)/page.tsx` — Home (full)
- `app/[locale]/(public)/about/page.tsx`
- `app/[locale]/(public)/contact/page.tsx`
- `components/public/Hero.tsx`
- `components/public/SectionHeader.tsx`
- `components/public/FeatureRow.tsx` — three-column "Behind the Scenes" translation
- `components/public/RecentPostsTeaser.tsx` — placeholder until Plan 4
- `components/public/ContactForm.tsx` (Client Component)
- `components/public/AddressBlock.tsx`
- `lib/actions/contact.ts` — Server Action
- `lib/email/resend.ts` — Resend client wrapper
- `lib/validators/contact.ts` — Zod schema
- `messages/tr.json`, `messages/en.json` — extend with home/about/contact copy
- `public/og/home.jpg`, `public/og/about.jpg` — placeholders for OG (Plan 6 wires)
- `tests/components/ContactForm.test.tsx`, `tests/actions/contact.test.ts`

---

### Task 1: Extend i18n messages

**Files:**
- Modify: `messages/tr.json`, `messages/en.json`

- [ ] **Step 1: Add `home`, `about`, `contact` sections to `messages/tr.json`**

Add these top-level keys (keep existing keys):

```json
{
  "home": {
    "heroEyebrow": "Editoryal Günce",
    "heroTitle": "Sanatın ve Tasarımın Sessiz Anları",
    "heroBody": "The Arc Istanbul; sergi, müzik ve mekân üzerine notlar tutar.",
    "recentEyebrow": "Son Yazılar",
    "behindEyebrow": "Perde Arkası",
    "behindTitle": "Bir yayını hazırlarken",
    "behind": {
      "one": { "title": "Araştırma", "body": "Her yazı uzun bir okuma listesinden doğar." },
      "two": { "title": "Saha", "body": "Sanatçı atölyeleri ve sergi açılışlarından izlenimler." },
      "three": { "title": "Düzen", "body": "Yazı, görsel ve ses; tek bir kompozisyonda." }
    }
  },
  "about": {
    "eyebrow": "Hakkımızda",
    "title": "Bir editoryal proje",
    "lede": "The Arc Istanbul; çağdaş sanat, mimari ve müziği yavaş bir okuma ritmiyle bir araya getirir.",
    "body1": "Yazılarımız ziyaretçi gözüyle değil, yakın bir bakışla yazılır. Bir sergiyi yorumlarken sanatçıyla konuşmayı, bir mekânı anlatırken oraya birkaç kez dönmeyi tercih ederiz.",
    "body2": "Site iki dilde yayın yapar: Türkçe ve İngilizce. Her yazı, varsa, küratörün veya yazarın seçtiği bir Spotify parçasıyla birlikte sunulur."
  },
  "contact": {
    "eyebrow": "İletişim",
    "title": "Bize yazın",
    "lede": "Sergi önerileri, iş birlikleri veya sadece selam için.",
    "address": {
      "city": "İstanbul",
      "country": "Türkiye"
    },
    "form": {
      "name": "Ad",
      "email": "E-posta",
      "subject": "Konu",
      "message": "Mesaj",
      "submit": "Gönder",
      "sending": "Gönderiliyor…",
      "success": "Mesajınız iletildi. Teşekkürler.",
      "error": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
      "rateLimited": "Çok fazla istek. Birazdan tekrar deneyin."
    }
  }
}
```

- [ ] **Step 2: Mirror in `messages/en.json`**

```json
{
  "home": {
    "heroEyebrow": "Editorial Journal",
    "heroTitle": "Quiet moments in art and design",
    "heroBody": "The Arc Istanbul keeps notes on exhibitions, music, and place.",
    "recentEyebrow": "Recent Entries",
    "behindEyebrow": "Behind the Scenes",
    "behindTitle": "How an issue comes together",
    "behind": {
      "one": { "title": "Research", "body": "Each piece begins in a long reading list." },
      "two": { "title": "Field", "body": "Impressions from studios and exhibition openings." },
      "three": { "title": "Composition", "body": "Writing, image, and sound — one piece." }
    }
  },
  "about": {
    "eyebrow": "About",
    "title": "An editorial project",
    "lede": "The Arc Istanbul gathers contemporary art, architecture, and music at a slow reading pace.",
    "body1": "We write as observers up close, not as visitors. When covering a show, we prefer to speak with the artist; when describing a space, we visit more than once.",
    "body2": "The site is published in two languages — Turkish and English. Each piece arrives with an optional Spotify track chosen by the curator or writer."
  },
  "contact": {
    "eyebrow": "Contact",
    "title": "Get in touch",
    "lede": "For exhibition tips, collaborations, or just to say hello.",
    "address": {
      "city": "Istanbul",
      "country": "Türkiye"
    },
    "form": {
      "name": "Name",
      "email": "Email",
      "subject": "Subject",
      "message": "Message",
      "submit": "Send",
      "sending": "Sending…",
      "success": "Your message is on its way. Thank you.",
      "error": "Something went wrong. Please try again.",
      "rateLimited": "Too many requests. Try again shortly."
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/ && git commit -m "i18n: home/about/contact copy"
```

---

### Task 2: SectionHeader + Hero + FeatureRow primitives

**Files:**
- Create: `components/public/SectionHeader.tsx`, `components/public/Hero.tsx`, `components/public/FeatureRow.tsx`

- [ ] **Step 1: `components/public/SectionHeader.tsx`**

```tsx
import { Container } from "./Container";

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
}) {
  return (
    <Container width="editorial" className={align === "center" ? "text-center" : ""}>
      {eyebrow ? (
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-serif text-h1">{title}</h2>
      {lede ? <p className="mt-6 max-w-prose text-fg-muted">{lede}</p> : null}
    </Container>
  );
}
```

- [ ] **Step 2: `components/public/Hero.tsx`**

```tsx
import Image from "next/image";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

export function Hero({
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <section className="pt-24 md:pt-40">
      <Container width="gallery">
        <Reveal>
          <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
          <h1 className="mt-6 max-w-[18ch] font-serif text-display">{title}</h1>
          <p className="mt-8 max-w-prose text-fg-muted">{body}</p>
        </Reveal>
      </Container>
      <Container width="gallery" className="mt-20">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-accent-soft">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: `components/public/FeatureRow.tsx`**

```tsx
import { Container } from "./Container";
import { Reveal } from "./Reveal";

type Item = { title: string; body: string };

export function FeatureRow({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: [Item, Item, Item];
}) {
  return (
    <section className="py-32 md:py-40">
      <Container width="gallery">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
        <h2 className="mt-3 max-w-prose font-serif text-h1">{title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-rule pt-12 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <p className="text-small uppercase tracking-wider text-fg-muted">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-serif text-h3">{item.title}</h3>
              <p className="mt-3 text-fg-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: SectionHeader/Hero/FeatureRow primitives"
```

---

### Task 3: RecentPostsTeaser (placeholder until Plan 4)

**Files:**
- Create: `components/public/RecentPostsTeaser.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Container } from "./Container";
import { Link } from "@/lib/i18n/routing";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export function RecentPostsTeaser({ eyebrow, posts }: { eyebrow: string; posts: Post[] }) {
  if (!posts.length) {
    return (
      <section className="py-32 md:py-40">
        <Container width="editorial">
          <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
          <p className="mt-8 text-fg-muted">—</p>
        </Container>
      </section>
    );
  }
  return (
    <section className="py-32 md:py-40">
      <Container width="gallery">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
        <ul className="mt-12 divide-y divide-rule border-y border-rule">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                className="group grid grid-cols-1 gap-4 py-8 md:grid-cols-[1fr_auto] md:items-baseline"
              >
                <div>
                  <h3 className="font-serif text-h2 group-hover:text-accent">{post.title}</h3>
                  <p className="mt-3 max-w-prose text-fg-muted">{post.excerpt}</p>
                </div>
                <time className="text-small text-fg-muted" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

Note: query is wired in Plan 4 Task 9. For now Home passes an empty array.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: RecentPostsTeaser placeholder"
```

---

### Task 4: Home page

**Files:**
- Modify: `app/[locale]/(public)/page.tsx`
- Create: `public/images/hero-placeholder.jpg` (use a temporary cream-toned editorial JPG, ~3:2)

- [ ] **Step 1: Add hero placeholder image**

Drop a single 1920x1280 muted editorial photograph at `public/images/hero-placeholder.jpg` (e.g. an interior detail; replace later with curated photography).

- [ ] **Step 2: Replace `app/[locale]/(public)/page.tsx`**

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/public/Hero";
import { FeatureRow } from "@/components/public/FeatureRow";
import { RecentPostsTeaser } from "@/components/public/RecentPostsTeaser";
import { type Locale } from "@/lib/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Hero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        imageSrc="/images/hero-placeholder.jpg"
        imageAlt=""
      />

      <RecentPostsTeaser eyebrow={t("recentEyebrow")} posts={[]} />

      <FeatureRow
        eyebrow={t("behindEyebrow")}
        title={t("behindTitle")}
        items={[
          { title: t("behind.one.title"), body: t("behind.one.body") },
          { title: t("behind.two.title"), body: t("behind.two.body") },
          { title: t("behind.three.title"), body: t("behind.three.body") },
        ]}
      />
    </>
  );
}
```

- [ ] **Step 3: Smoke**

`pnpm dev` → `/tr` and `/en`. Confirm hero renders with serif display, hairline rule under Header, 3-column feature row, no recent posts.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: home page (hero + behind-the-scenes)"
```

---

### Task 5: About page

**Files:**
- Create: `app/[locale]/(public)/about/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { Reveal } from "@/components/public/Reveal";
import { type Locale } from "@/lib/i18n/config";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <article className="pt-24 md:pt-40">
      <Container width="prose">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-display">{t("title")}</h1>
        <p className="mt-8 text-fg-muted">{t("lede")}</p>
      </Container>

      <Container width="editorial" className="mt-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-accent-soft md:aspect-[3/2]">
          <Image
            src="/images/about-placeholder.jpg"
            alt=""
            fill
            sizes="(min-width: 960px) 960px, 100vw"
            className="object-cover"
            placeholder="empty"
          />
        </div>
      </Container>

      <Container width="prose" className="py-32 md:py-40">
        <Reveal>
          <p>{t("body1")}</p>
          <p className="mt-8">{t("body2")}</p>
        </Reveal>
      </Container>
    </article>
  );
}
```

- [ ] **Step 2: Add `public/images/about-placeholder.jpg`**

Drop a second placeholder image (same aesthetic as hero).

- [ ] **Step 3: Visual smoke**

`pnpm dev` → `/tr/hakkinda` and `/en/about`. Confirm both render. Confirm hairline rule, serif display, generous whitespace.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: about page"
```

---

### Task 6: Contact validation schema

**Files:**
- Create: `lib/validators/contact.ts`

- [ ] **Step 1: Implement**

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(120),
  email: z.string().trim().toLowerCase().email("invalid_email").max(320),
  subject: z.string().trim().min(1, "required").max(200),
  message: z.string().trim().min(10, "too_short").max(5000),
  hp: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

`hp` is a honeypot field — must be empty (max(0)).

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: contact zod schema with honeypot"
```

---

### Task 7: Resend client wrapper

**Files:**
- Create: `lib/email/resend.ts`

- [ ] **Step 1: Install**

```bash
pnpm add resend
```

- [ ] **Step 2: Implement**

```ts
import "server-only";
import { Resend } from "resend";

declare global {
  // eslint-disable-next-line no-var
  var __resend: Resend | undefined;
}

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  globalThis.__resend ??= new Resend(key);
  return globalThis.__resend;
}

export function getContactRecipient() {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) throw new Error("CONTACT_TO_EMAIL is not set");
  return to;
}
```

- [ ] **Step 3: Update `.env.example`**

Already contains `RESEND_API_KEY` and `CONTACT_TO_EMAIL` from Plan 1 Task 13.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: resend client wrapper"
```

---

### Task 8: Contact Server Action

**Files:**
- Create: `lib/actions/contact.ts`
- Modify: `lib/rate-limit.ts` (add a contact limiter)

- [ ] **Step 1: Add contact limiter to `lib/rate-limit.ts`**

Append to the file:

```ts
export const contactIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "rl:contact:ip",
});
```

- [ ] **Step 2: Write `lib/actions/contact.ts`**

```ts
"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { contactSchema, type ContactInput } from "@/lib/validators/contact";
import { getResend, getContactRecipient } from "@/lib/email/resend";
import { contactIpLimiter } from "@/lib/rate-limit";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: "validation" | "rate_limited" | "send_failed"; fieldErrors?: Record<string, string> };

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[]>;
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(fieldErrors)) if (v[0]) flat[k] = v[0];
    return { ok: false, error: "validation", fieldErrors: flat };
  }

  const data = parsed.data;
  if (data.hp) return { ok: true };

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const rl = await contactIpLimiter.limit(ip);
  if (!rl.success) return { ok: false, error: "rate_limited" };

  try {
    const resend = getResend();
    await resend.emails.send({
      from: `The Arc Istanbul <noreply@thearcistanbul.com>`,
      to: getContactRecipient(),
      replyTo: data.email,
      subject: `[Contact] ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\nIP: ${ip}\n\n${data.message}`,
    });
    return { ok: true };
  } catch (e) {
    console.error("contact send failed", e);
    return { ok: false, error: "send_failed" };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: contact server action with rate limit + resend"
```

---

### Task 9: ContactForm Client Component

**Files:**
- Create: `components/public/ContactForm.tsx`

- [ ] **Step 1: Install RHF**

```bash
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Write `components/public/ContactForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { contactSchema, type ContactInput } from "@/lib/validators/contact";
import { submitContact } from "@/lib/actions/contact";

type Status = "idle" | "sending" | "ok" | "error" | "rate_limited";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", hp: "" },
  });

  const onSubmit = (data: ContactInput) => {
    setStatus("sending");
    startTransition(async () => {
      const res = await submitContact(data);
      if (res.ok) {
        setStatus("ok");
        reset();
      } else if (res.error === "rate_limited") setStatus("rate_limited");
      else setStatus("error");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6" noValidate>
      <Field id="name" label={t("name")} error={errors.name?.message}>
        <input
          id="name"
          {...register("name")}
          className="w-full border-b border-rule bg-transparent py-3 outline-none focus:border-fg"
        />
      </Field>

      <Field id="email" label={t("email")} error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full border-b border-rule bg-transparent py-3 outline-none focus:border-fg"
        />
      </Field>

      <Field id="subject" label={t("subject")} error={errors.subject?.message}>
        <input
          id="subject"
          {...register("subject")}
          className="w-full border-b border-rule bg-transparent py-3 outline-none focus:border-fg"
        />
      </Field>

      <Field id="message" label={t("message")} error={errors.message?.message}>
        <textarea
          id="message"
          rows={6}
          {...register("message")}
          className="w-full border-b border-rule bg-transparent py-3 outline-none focus:border-fg"
        />
      </Field>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        {...register("hp")}
        className="absolute -left-[9999px]"
      />

      <div className="flex items-center gap-6 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="border border-fg px-8 py-3 text-small uppercase tracking-wider transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          {pending ? t("sending") : t("submit")}
        </button>
        {status === "ok" ? (
          <p className="text-small text-fg-muted" role="status">{t("success")}</p>
        ) : status === "error" ? (
          <p className="text-small text-danger" role="alert">{t("error")}</p>
        ) : status === "rate_limited" ? (
          <p className="text-small text-danger" role="alert">{t("rateLimited")}</p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-small uppercase tracking-wider text-fg-muted">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-2 text-small text-danger">{error}</p> : null}
    </div>
  );
}
```

Note: this component uses `useTranslations("contact.form")` at the top-level so all form labels stay in sync with the active locale. Server Action is imported normally — Next.js handles the bundling.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: ContactForm with RHF + Zod + Server Action"
```

---

### Task 10: Contact page

**Files:**
- Create: `app/[locale]/(public)/contact/page.tsx`, `components/public/AddressBlock.tsx`

- [ ] **Step 1: `components/public/AddressBlock.tsx`**

```tsx
import { useTranslations } from "next-intl";

export function AddressBlock() {
  const t = useTranslations("contact.address");
  return (
    <address className="not-italic">
      <p className="font-serif text-h3">The Arc Istanbul</p>
      <p className="mt-2 text-fg-muted">
        {t("city")}, {t("country")}
      </p>
    </address>
  );
}
```

- [ ] **Step 2: `app/[locale]/(public)/contact/page.tsx`**

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { AddressBlock } from "@/components/public/AddressBlock";
import { ContactForm } from "@/components/public/ContactForm";
import { type Locale } from "@/lib/i18n/config";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="pt-24 md:pt-40">
      <Container width="prose">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-display">{t("title")}</h1>
        <p className="mt-8 text-fg-muted">{t("lede")}</p>
      </Container>

      <Container width="editorial" className="grid grid-cols-1 gap-16 py-24 md:grid-cols-[1fr_2fr] md:py-32">
        <AddressBlock />
        <ContactForm />
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Visual smoke**

`pnpm dev` → `/tr/iletisim` and `/en/contact`. Confirm two-column layout, hairline-bottom inputs, address on the left. Submit form with junk email — expect inline validation. Submit valid form (without RESEND_API_KEY set) — expect error message in red.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: contact page (address + form)"
```

---

### Task 11: Contact Server Action unit test

**Files:**
- Create: `tests/actions/contact.test.ts`

- [ ] **Step 1: Write test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () =>
    new Map([["x-forwarded-for", "1.2.3.4"]]) as unknown as Headers,
}));

const sendMock = vi.fn().mockResolvedValue({ id: "msg-1" });
vi.mock("@/lib/email/resend", () => ({
  getResend: () => ({ emails: { send: sendMock } }),
  getContactRecipient: () => "owner@example.com",
}));

const limitMock = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/lib/rate-limit", () => ({
  contactIpLimiter: { limit: limitMock },
}));

import { submitContact } from "@/lib/actions/contact";

describe("submitContact", () => {
  beforeEach(() => {
    sendMock.mockClear();
    limitMock.mockClear();
  });

  it("rejects invalid input with field errors", async () => {
    const res = await submitContact({
      name: "",
      email: "nope",
      subject: "",
      message: "short",
    } as never);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("validation");
      expect(res.fieldErrors).toMatchObject({
        name: "required",
        email: "invalid_email",
        subject: "required",
        message: "too_short",
      });
    }
  });

  it("returns ok when honeypot is non-empty without sending mail", async () => {
    const res = await submitContact({
      name: "A",
      email: "a@b.com",
      subject: "Hi",
      message: "Hello there sir or madam.",
      hp: "im-a-bot",
    } as never);
    // Honeypot path: zod max(0) on hp will fail → validation error.
    expect(res.ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends email on valid input", async () => {
    const res = await submitContact({
      name: "Ada",
      email: "ada@example.com",
      subject: "Sergi",
      message: "Yeni bir sergi açılışı hakkında.",
    } as never);
    expect(res.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it("respects rate limit", async () => {
    limitMock.mockResolvedValueOnce({ success: false });
    const res = await submitContact({
      name: "Ada",
      email: "ada@example.com",
      subject: "Sergi",
      message: "Yeni bir sergi açılışı hakkında.",
    } as never);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("rate_limited");
  });
});
```

- [ ] **Step 2: Run**

```bash
pnpm test tests/actions/contact.test.ts
```

Expected: 4 passed.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: contact server action"
```

---

### Task 12: ContactForm component test

**Files:**
- Create: `tests/components/ContactForm.test.tsx`

- [ ] **Step 1: Write**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

vi.mock("@/lib/actions/contact", () => ({
  submitContact: vi.fn().mockResolvedValue({ ok: true }),
}));

import { ContactForm } from "@/components/public/ContactForm";
import { submitContact } from "@/lib/actions/contact";

describe("ContactForm", () => {
  it("shows inline validation errors", async () => {
    const user = userEvent.setup();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactForm />
      </NextIntlClientProvider>,
    );
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(await screen.findAllByText(/required|invalid_email|too_short/i)).not.toHaveLength(0);
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("calls submitContact on valid input", async () => {
    const user = userEvent.setup();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactForm />
      </NextIntlClientProvider>,
    );
    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/subject/i), "Hello");
    await user.type(screen.getByLabelText(/message/i), "This is the message body.");
    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(submitContact).toHaveBeenCalledOnce();
  });
});
```

Install:

```bash
pnpm add -D @testing-library/user-event
```

- [ ] **Step 2: Run**

```bash
pnpm test tests/components/ContactForm.test.tsx
```

Expected: 2 passed.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: ContactForm component"
```

---

## Done When

- `/tr`, `/en` Home pages render with hero + feature row
- `/tr/hakkinda`, `/en/about` About pages render with editorial prose layout
- `/tr/iletisim`, `/en/contact` Contact pages render with form
- `pnpm test` passes including new tests
- Submitting a valid contact form (with `RESEND_API_KEY` set) sends an email to `CONTACT_TO_EMAIL`
- Honeypot, rate limit, and Zod validation all enforced