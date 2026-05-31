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
    slugTr: "renk-ve-beton-uzerine",
    slugEn: "on-colour-and-concrete",
    titleTr: "Renk ve beton üzerine",
    titleEn: "On colour and concrete",
    excerptTr: "Bir brütalist cephenin, gün boyunca değişen ışıkla nasıl yumuşadığına dair notlar.",
    excerptEn: "Notes on how a brutalist façade softens as the light moves across a day.",
    category: "essay",
    date: "2026-05-18",
  },
  {
    slugTr: "uc-sesle-bir-atolye-ziyareti",
    slugEn: "a-studio-visit-in-three-sounds",
    titleTr: "Üç sesle bir atölye ziyareti",
    titleEn: "A studio visit, in three sounds",
    excerptTr: "Bir heykeltıraşın çalışma odasında geçen bir öğleden sonranın sesli günlüğü.",
    excerptEn: "An audio diary of an afternoon in a sculptor's working room.",
    category: "field",
    date: "2026-05-09",
  },
  {
    slugTr: "bos-bir-galeri-uzerine-notlar",
    slugEn: "notes-on-an-empty-gallery",
    titleTr: "Boş bir galeri üzerine notlar",
    titleEn: "Notes on an empty gallery",
    excerptTr: "Açılıştan bir gün önce, henüz kimsenin görmediği bir serginin sessizliği.",
    excerptEn: "The quiet of a show the day before it opens, before anyone has seen it.",
    category: "review",
    date: "2026-04-27",
  },
  {
    slugTr: "beyaz-bir-duvarin-agirligi",
    slugEn: "the-weight-of-a-white-wall",
    titleTr: "Beyaz bir duvarın ağırlığı",
    titleEn: "The weight of a white wall",
    excerptTr: "Müze duvarının neyi taşıdığı ve neyi sakladığı üzerine uzun bir bakış.",
    excerptEn: "A long look at what a museum wall carries, and what it hides.",
    category: "essay",
    date: "2026-04-12",
  },
  {
    slugTr: "limanin-mimarisi",
    slugEn: "the-architecture-of-a-harbour",
    titleTr: "Limanın mimarisi",
    titleEn: "The architecture of a harbour",
    excerptTr: "İstanbul'un su kıyısında, mekânın ve belleğin üst üste bindiği bir yürüyüş.",
    excerptEn: "A walk along Istanbul's waterfront where place and memory overlap.",
    category: "field",
    date: "2026-03-30",
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
