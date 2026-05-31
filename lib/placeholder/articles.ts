import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/lib/i18n/config";

/**
 * Placeholder editorial articles. One shared source feeds both the home
 * "Recent writing" grid and the Journal index until Plan 4 wires the database.
 * Copy is placeholder — admins replace it once live.
 */
export type ArticleCategory = "essay" | "field" | "review";

export type PlaceholderArticle = {
  slugTr: string;
  slugEn: string;
  titleTr: string;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  category: ArticleCategory;
  /** ISO date (YYYY-MM-DD) — used for sorting and <time>. */
  date: string;
};

export const placeholderArticles: PlaceholderArticle[] = [
  {
    slugTr: "yuce",
    slugEn: "sublime",
    titleTr: "Yüce",
    titleEn: "Sublime",
    excerptTr: "Entelektüel sohbetlerin estetik incelikle buluştuğu yer.",
    excerptEn: "Where intellectual conversations meet aesthetic refinement.",
    category: "field",
    date: "2024-01-15",
  },
  {
    slugTr: "paolo-sorrentino-kaosta-guzellik",
    slugEn: "paolo-sorrentino-beauty-in-chaos",
    titleTr: "Paolo Sorrentino: Kaosta Güzelliği Bulan Yönetmen",
    titleEn: "Paolo Sorrentino: The Director Who Finds Beauty in Chaos",
    excerptTr: "Sorrentino'nun sessiz zarafetine bir bakış — güzelliğin ve kaosun çarpıştığı yer.",
    excerptEn: "Into the quiet elegance of Sorrentino's world — where beauty and chaos collide.",
    category: "essay",
    date: "2024-01-08",
  },
  {
    slugTr: "art-nouveau-klimt-mucevher",
    slugEn: "art-nouveau-klimt-jewelry",
    titleTr: "Art Nouveau, Gustav Klimt ve Mücevher: Altın Bir Bağ",
    titleEn: "Art Nouveau, Gustav Klimt, and Jewelry: A Golden Connection",
    excerptTr: "Art Nouveau'nun akışkan çizgilerini, Klimt'in altınını ve mücevherin zarafetini ne birleştirir?",
    excerptEn: "What connects Art Nouveau's flowing lines, Klimt's gold, and the elegance of jewelry?",
    category: "essay",
    date: "2024-01-02",
  },
];

const IMAGE_DIR = "images/journal";
const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"] as const;

/**
 * Resolve a cover image for an article by looking for a file named after its
 * English slug under `public/images/journal/` (any common extension). Returns
 * the public path if a file exists, otherwise null so the UI shows a muted
 * placeholder. This means dropping a photo into that folder "just works" with
 * no code change — checked at render/build time.
 */
export function resolveArticleImage(slugEn: string): string | null {
  try {
    for (const ext of IMAGE_EXTENSIONS) {
      const rel = `${IMAGE_DIR}/${slugEn}.${ext}`;
      if (fs.existsSync(path.join(process.cwd(), "public", rel))) {
        return `/${rel}`;
      }
    }
  } catch {
    // fs unavailable (non-node runtime) — fall through to placeholder.
  }
  return null;
}

export type LocalizedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  date: string;
  /** Public path to a cover image, or null when none has been provided yet. */
  image: string | null;
};

export function localizeArticle(article: PlaceholderArticle, locale: Locale): LocalizedArticle {
  return {
    slug: locale === "tr" ? article.slugTr : article.slugEn,
    title: locale === "tr" ? article.titleTr : article.titleEn,
    excerpt: locale === "tr" ? article.excerptTr : article.excerptEn,
    category: article.category,
    date: article.date,
    image: resolveArticleImage(article.slugEn),
  };
}

/** Reverse-chronological localized articles, optionally limited. */
export function getArticles(locale: Locale, limit?: number): LocalizedArticle[] {
  const sorted = [...placeholderArticles].sort((a, b) => b.date.localeCompare(a.date));
  const sliced = typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  return sliced.map((a) => localizeArticle(a, locale));
}
