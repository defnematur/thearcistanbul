# The Arc Istanbul

Bilingual (TR/EN) editorial blog with a museum-website aesthetic. Next.js 16 (App
Router) + next-intl. Database, auth, and content come in later plans
(Neon + Drizzle + Auth.js v5).

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — the root redirects to a locale (`/tr` or `/en`)
based on your browser language.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |

## Stack

- **Next.js 16** App Router + React Server Components
- **next-intl v4** — subpath i18n (`/tr`, `/en`) with localized pathnames
- **Tailwind CSS v4** — design tokens in `app/globals.css` (`@theme`)
- **Fraunces** (serif) + **Geist** (sans) via `next/font`
- **Vitest** + Testing Library (unit) and **Playwright** (e2e)

See `docs/superpowers/plans/` for the implementation plans.
