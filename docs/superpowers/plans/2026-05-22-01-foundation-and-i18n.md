# Foundation & i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Next.js 15 App Router project with the museum-aesthetic design system (Fraunces + Geist, cream/black tokens), bilingual routing (`/tr`, `/en`) via next-intl, header with TR/EN toggle, and footer.

**Architecture:** App Router + React Server Components. Subpath i18n with locale-specific path segments via `next-intl` pathnames. Tailwind for utilities, CSS variables for design tokens. Vitest + Testing Library + Playwright for tests. No DB or auth yet — pure shell.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS, next-intl, next/font, Fraunces, Geist, Vitest, @testing-library/react, Playwright.

---

## File Structure

**Create:**
- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.example`, `.eslintrc.json`, `.prettierrc`, `README.md`
- `app/globals.css` — design tokens, base typography
- `app/layout.tsx` — root HTML shell (lang inherited via locale layout)
- `app/[locale]/layout.tsx` — locale-aware layout with header + footer
- `app/[locale]/(public)/page.tsx` — placeholder Home (real content comes in Plan 3)
- `app/[locale]/not-found.tsx` — locale-aware 404
- `app/not-found.tsx` — root 404 fallback
- `lib/i18n/config.ts` — locales + pathnames config
- `lib/i18n/request.ts` — next-intl request config (loads messages)
- `lib/i18n/routing.ts` — typed router/Link export
- `messages/tr.json`, `messages/en.json` — UI strings
- `middleware.ts` — next-intl middleware
- `components/public/Header.tsx`, `LanguageToggle.tsx`, `Footer.tsx`, `Container.tsx`, `Reveal.tsx`
- `tailwind.config.ts`, `postcss.config.mjs`
- `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`
- `tests/components/Header.test.tsx`, `tests/components/LanguageToggle.test.tsx`, `tests/e2e/locale-routing.spec.ts`

---

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Init pnpm + Next.js**

Run from repo root (`/Users/defnematur/PycharmProjects/thearcistanbul`):

```bash
pnpm dlx create-next-app@latest . \
  --typescript --eslint --tailwind --app --src-dir=false \
  --turbopack --import-alias "@/*" --use-pnpm --skip-install
```

If the directory is non-empty, accept overwrites only for the stub `main.py` (delete it after) and keep `CLAUDE.md`, `docs/`, `vision/`, `.venv/`.

- [ ] **Step 2: Remove Python stub**

```bash
rm /Users/defnematur/PycharmProjects/thearcistanbul/main.py
```

- [ ] **Step 3: Pin Node 24 in `.nvmrc` and engines**

Create `.nvmrc` with content `24`. Edit `package.json` to add:

```json
"engines": {
  "node": ">=24.0.0"
}
```

- [ ] **Step 4: Install deps**

```bash
pnpm install
```

- [ ] **Step 5: Verify dev server boots**

```bash
pnpm dev
```

Expected: server starts on http://localhost:3000 and the default Next page renders. Stop the server (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git init && git add -A
git commit -m "chore: initialize Next.js 15 App Router project"
```

---

### Task 2: Strict TypeScript + ESLint + Prettier

**Files:**
- Modify: `tsconfig.json`
- Create: `.prettierrc`, `.prettierignore`
- Modify: `.eslintrc.json` (or `eslint.config.mjs` if Next 15 default)

- [ ] **Step 1: Tighten tsconfig**

Set these in `tsconfig.json` `compilerOptions`:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "forceConsistentCasingInFileNames": true
}
```

- [ ] **Step 2: Add Prettier**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
.next
node_modules
pnpm-lock.yaml
.venv
vision
```

- [ ] **Step 3: Verify lint + typecheck**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: strict typescript + prettier config"
```

---

### Task 3: Design tokens (CSS variables + Tailwind)

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #fafaf7;
  --bg-elevated: #ffffff;
  --fg: #0a0a0a;
  --fg-muted: #6b6b6b;
  --rule: #e6e3dc;
  --accent: #8b7355;
  --accent-soft: #efebe2;
  --danger: #b23a3a;

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-color-scheme: dark) {
  /* Intentionally light-only for v1 — museum aesthetic.
     If dark mode is added later, redefine tokens here. */
}

html, body {
  background-color: var(--bg);
  color: var(--fg);
}

body {
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif), Georgia, serif;
  font-weight: 400;
}

a { color: inherit; text-decoration: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        rule: "var(--rule)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        danger: "var(--danger)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.75rem, 6vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h1: ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        h2: ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h3: ["1.375rem", { lineHeight: "1.25" }],
        body: ["1.0625rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
      },
      maxWidth: {
        prose: "720px",
        editorial: "960px",
        gallery: "1280px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Smoke test render**

Edit `app/page.tsx` temporarily to:

```tsx
export default function Page() {
  return (
    <main className="mx-auto max-w-prose px-6 py-40">
      <h1 className="text-display">The Arc Istanbul</h1>
      <p className="mt-8 text-fg-muted">Design tokens smoke test.</p>
    </main>
  );
}
```

Run `pnpm dev`, open http://localhost:3000, confirm: cream background, serif heading, muted paragraph. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: museum design tokens + Tailwind theme"
```

---

### Task 4: Load Fraunces + Geist via next/font

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: { default: "The Arc Istanbul", template: "%s — The Arc Istanbul" },
  description: "Editorial journal of The Arc Istanbul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Install Geist**

```bash
pnpm add geist
```

- [ ] **Step 3: Verify fonts load**

`pnpm dev`, view-source on http://localhost:3000, confirm `<style>` blocks reference Fraunces and Geist `font-display: swap`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: load Fraunces + Geist via next/font"
```

---

### Task 5: next-intl install + config

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/request.ts`, `lib/i18n/routing.ts`
- Create: `messages/tr.json`, `messages/en.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install**

```bash
pnpm add next-intl
```

- [ ] **Step 2: Create `lib/i18n/config.ts`**

```ts
export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const pathnames = {
  "/": "/",
  "/about": { tr: "/hakkinda", en: "/about" },
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/contact": { tr: "/iletisim", en: "/contact" },
} as const;

export const localePrefix = "always" as const;
```

- [ ] **Step 3: Create `lib/i18n/routing.ts`**

```ts
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales, localePrefix, pathnames } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation(routing);
```

- [ ] **Step 4: Create `lib/i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (!requested || !locales.includes(requested as Locale)) notFound();
  const locale = requested as Locale;
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
```

- [ ] **Step 5: Wire next.config**

Replace `next.config.ts`:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
};

export default withNextIntl(config);
```

- [ ] **Step 6: Seed message files**

`messages/tr.json`:

```json
{
  "nav": { "home": "Ana Sayfa", "about": "Hakkımızda", "blog": "Günce", "contact": "İletişim" },
  "languageToggle": { "label": "Dil", "tr": "Türkçe", "en": "English" },
  "footer": {
    "tagline": "The Arc Istanbul",
    "quickLinks": "Bağlantılar",
    "policies": "Politikalar",
    "contact": "İletişim",
    "rights": "Tüm hakları saklıdır."
  },
  "common": { "readMore": "Devamını oku", "loading": "Yükleniyor" }
}
```

`messages/en.json`:

```json
{
  "nav": { "home": "Home", "about": "About", "blog": "Journal", "contact": "Contact" },
  "languageToggle": { "label": "Language", "tr": "Türkçe", "en": "English" },
  "footer": {
    "tagline": "The Arc Istanbul",
    "quickLinks": "Links",
    "policies": "Policies",
    "contact": "Contact",
    "rights": "All rights reserved."
  },
  "common": { "readMore": "Read more", "loading": "Loading" }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: next-intl config with locale pathnames"
```

---

### Task 6: middleware.ts (i18n routing)

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

Admin gate logic is added in Plan 2 (DB & Auth).

- [ ] **Step 2: Manual smoke**

`pnpm dev`. Confirm:
- `http://localhost:3000/` → redirects to `/tr`
- `http://localhost:3000/en` → renders
- `http://localhost:3000/zz` → 404

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: i18n middleware"
```

---

### Task 7: [locale] layout + placeholder home

**Files:**
- Create: `app/[locale]/layout.tsx`, `app/[locale]/(public)/page.tsx`, `app/[locale]/not-found.tsx`
- Delete: `app/page.tsx` (replaced by `[locale]/(public)/page.tsx`)

- [ ] **Step 1: Create `app/[locale]/layout.tsx`**

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 2: Update root `app/layout.tsx` to forward locale**

Replace the `<html lang="tr">` line with a dynamic version that takes locale from the segment. Since the root layout cannot read params for the [locale] segment, move the `<html>` tag into the [locale] layout instead. Update root `app/layout.tsx`:

```tsx
import "./globals.css";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${fraunces.variable} ${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

(The `<html lang>` is set by `[locale]/layout.tsx` via a `<script>` or by reading params — Next 15 allows multiple `<html>` only at root. We set `lang` dynamically below.)

In `app/[locale]/layout.tsx`, instead of nesting `<html>`, set lang attribute via React's `<html lang={locale}>` only if this is the only html. The cleanest pattern: keep `<html>` in root but set lang via a Server Component effect — or hoist the full HTML shell into the locale layout and remove root `app/layout.tsx`'s `<html>`.

Implement the hoisted approach: delete `app/layout.tsx` and put the full shell in `app/[locale]/layout.tsx`:

Final `app/[locale]/layout.tsx`:

```tsx
import "@/app/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { locales, type Locale } from "@/lib/i18n/config";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${GeistSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Delete `app/layout.tsx`:

```bash
rm app/layout.tsx app/page.tsx
```

- [ ] **Step 3: Create placeholder home `app/[locale]/(public)/page.tsx`**

```tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-editorial px-6 py-40">
      <h1 className="text-display">The Arc Istanbul</h1>
      <p className="mt-8 text-fg-muted">{t("home")} — placeholder</p>
    </section>
  );
}
```

- [ ] **Step 4: Create `app/[locale]/not-found.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-prose px-6 py-40">
      <p className="text-small text-fg-muted">404</p>
      <h1 className="mt-4 text-h1">Sayfa bulunamadı / Page not found</h1>
      <Link href="/" className="mt-8 inline-block border-b border-fg pb-0.5">
        {t("home")}
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: Smoke**

`pnpm dev` → `/tr` and `/en` should render with `lang` attribute matching. View source to confirm `<html lang="tr">` on `/tr` and `<html lang="en">` on `/en`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: locale layout with header/footer slots"
```

---

### Task 8: Container + Reveal primitives

**Files:**
- Create: `components/public/Container.tsx`, `components/public/Reveal.tsx`

- [ ] **Step 1: Write `Container.tsx`**

```tsx
import { type ReactNode } from "react";
import { clsx } from "clsx";

type Width = "prose" | "editorial" | "gallery";

export function Container({
  children,
  width = "editorial",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mx-auto px-6 md:px-8",
        width === "prose" && "max-w-prose",
        width === "editorial" && "max-w-editorial",
        width === "gallery" && "max-w-gallery",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Install clsx**

```bash
pnpm add clsx
```

- [ ] **Step 3: Write `Reveal.tsx`** (Client Component, IntersectionObserver, respects reduced motion)

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 300ms var(--ease-out) ${delay}ms, transform 300ms var(--ease-out) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Container and Reveal primitives"
```

---

### Task 9: LanguageToggle (Client Component)

**Files:**
- Create: `components/public/LanguageToggle.tsx`
- Create: `tests/components/LanguageToggle.test.tsx`

- [ ] **Step 1: Write failing test `tests/components/LanguageToggle.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messagesEn from "@/messages/en.json";
import { LanguageToggle } from "@/components/public/LanguageToggle";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
  usePathname: () => "/en/blog",
}));

describe("LanguageToggle", () => {
  it("renders both locale labels and marks current locale active", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        <LanguageToggle />
      </NextIntlClientProvider>,
    );
    const en = screen.getByRole("link", { name: /english/i });
    const tr = screen.getByRole("link", { name: /türkçe/i });
    expect(en).toHaveAttribute("aria-current", "page");
    expect(tr).not.toHaveAttribute("aria-current");
  });
});
```

- [ ] **Step 2: Add Vitest + Testing Library**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Run test — expect failure**

```bash
pnpm test
```

Expected: fails — LanguageToggle does not exist.

- [ ] **Step 4: Implement `components/public/LanguageToggle.tsx`**

```tsx
"use client";

import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageToggle() {
  const params = useParams<{ locale: Locale }>();
  const pathname = usePathname();
  const t = useTranslations("languageToggle");
  const current = params.locale;

  function swap(target: Locale) {
    if (!pathname) return `/${target}`;
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  return (
    <div aria-label={t("label")} className="flex items-center gap-3 text-small">
      {locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="text-rule">/</span>}
          <a
            href={swap(loc)}
            aria-current={loc === current ? "page" : undefined}
            className={loc === current ? "text-fg" : "text-fg-muted hover:text-fg"}
          >
            {t(loc)}
          </a>
        </span>
      ))}
    </div>
  );
}
```

Note: uses raw `<a>` rather than next-intl's localized `Link` because we are translating the *current path* across locales; the pathname segments map 1:1 since next-intl pathnames are computed from the un-localized template. The middleware will resolve `/tr/about` → `/tr/hakkinda` if pathnames are configured. For Task 9 the simple swap is acceptable; Task 11 below upgrades it to use next-intl's pathname mapping.

- [ ] **Step 5: Run test — expect pass**

```bash
pnpm test
```

Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: LanguageToggle component"
```

---

### Task 10: Header

**Files:**
- Create: `components/public/Header.tsx`
- Create: `tests/components/Header.test.tsx`

- [ ] **Step 1: Failing test `tests/components/Header.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messagesTr from "@/messages/tr.json";
import { Header } from "@/components/public/Header";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "tr" }),
  usePathname: () => "/tr",
}));

describe("Header", () => {
  it("renders brand, nav links, and language toggle", () => {
    render(
      <NextIntlClientProvider locale="tr" messages={messagesTr}>
        <Header />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("link", { name: /the arc istanbul/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hakkımızda/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /günce/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iletişim/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /türkçe/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
pnpm test
```

- [ ] **Step 3: Implement `components/public/Header.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Container } from "./Container";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const t = useTranslations("nav");
  return (
    <header className="border-b border-rule">
      <Container width="gallery" className="flex items-center justify-between py-6">
        <Link href="/" className="font-serif text-h3 tracking-tight">
          The Arc Istanbul
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 text-small md:flex">
          <Link href="/about" className="text-fg-muted transition-colors hover:text-fg">
            {t("about")}
          </Link>
          <Link href="/blog" className="text-fg-muted transition-colors hover:text-fg">
            {t("blog")}
          </Link>
          <Link href="/contact" className="text-fg-muted transition-colors hover:text-fg">
            {t("contact")}
          </Link>
          <LanguageToggle />
        </nav>
        <div className="md:hidden">
          <LanguageToggle />
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 4: Test passes**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: Header with nav and language toggle"
```

---

### Task 11: Footer (4-column, museum-translated from vision)

**Files:**
- Create: `components/public/Footer.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Container } from "./Container";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-40 border-t border-rule">
      <Container width="gallery" className="grid grid-cols-2 gap-12 py-20 md:grid-cols-4">
        <div>
          <p className="font-serif text-h3">{t("tagline")}</p>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("quickLinks")}</p>
          <ul className="mt-4 space-y-2 text-small">
            <li><Link href="/about" className="hover:text-accent">{tNav("about")}</Link></li>
            <li><Link href="/blog" className="hover:text-accent">{tNav("blog")}</Link></li>
            <li><Link href="/contact" className="hover:text-accent">{tNav("contact")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("policies")}</p>
          <ul className="mt-4 space-y-2 text-small text-fg-muted">
            <li>—</li>
          </ul>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("contact")}</p>
          <p className="mt-4 text-small text-fg-muted">İstanbul, Türkiye</p>
        </div>
      </Container>
      <Container width="gallery" className="flex justify-between border-t border-rule py-8 text-small text-fg-muted">
        <span>© {year} The Arc Istanbul</span>
        <span>{t("rights")}</span>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 2: Visual smoke**

`pnpm dev` → `/tr` and `/en`. Confirm header, placeholder hero, footer all render with cream background, hairline rules, serif headings.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: museum-style 4-column footer"
```

---

### Task 12: E2E locale routing test (Playwright)

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/locale-routing.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add scripts to `package.json`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Write `tests/e2e/locale-routing.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("root redirects to /tr", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/tr$/);
});

test("language toggle switches locale", async ({ page }) => {
  await page.goto("/tr");
  await page.getByRole("link", { name: /english/i }).first().click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("invalid locale 404s", async ({ page }) => {
  const res = await page.goto("/zz");
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 4: Run**

```bash
pnpm test:e2e
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test: e2e locale routing"
```

---

### Task 13: `.env.example` + README

**Files:**
- Create: `.env.example`, `README.md`

- [ ] **Step 1: `.env.example`**

```
# Database (Plan 2)
DATABASE_URL=

# Auth (Plan 2)
AUTH_SECRET=

# Vercel Blob (Plan 5)
BLOB_READ_WRITE_TOKEN=

# Upstash rate limit (Plan 2)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (Plan 3 contact form)
RESEND_API_KEY=
CONTACT_TO_EMAIL=
```

- [ ] **Step 2: `README.md`**

```markdown
# The Arc Istanbul

Bilingual editorial blog. Next.js 15 + Neon + Drizzle + Auth.js v5.

## Development

```bash
pnpm install
pnpm dev
```

See `docs/superpowers/plans/` for the implementation plans.
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "docs: env example and readme"
```

---

## Done When

- `pnpm test` passes (unit)
- `pnpm test:e2e` passes (3 specs)
- `pnpm exec tsc --noEmit && pnpm lint` exit 0
- `/` redirects to `/tr`, language toggle flips to `/en` and updates `<html lang>`
- Header + Footer render with museum tokens on every locale page