export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const pathnames = {
  "/": "/",
  "/about": { tr: "/hakkinda", en: "/about" },
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/gallery": { tr: "/galeri", en: "/gallery" },
  "/contact": { tr: "/iletisim", en: "/contact" },
} as const;

export const localePrefix = "always" as const;
