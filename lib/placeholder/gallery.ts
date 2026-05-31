import type { Locale } from "@/lib/i18n/config";

/**
 * Placeholder gallery items. Reuses existing images for now — add gallery photos
 * under public/images/gallery/ and extend this list (admins manage this later).
 */
export type GalleryAspect = "portrait" | "landscape" | "square";

export type GalleryItem = {
  src: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  date: string;
  aspect: GalleryAspect;
};

export const galleryItems: GalleryItem[] = [
  {
    src: "/images/home/hero.jpg",
    titleEn: "Bosphorus from the old town",
    titleTr: "Eski şehirden Boğaz",
    descEn: "A street opening to the strait, Istanbul.",
    descTr: "Boğaza açılan bir sokak, İstanbul.",
    date: "2026-01-20",
    aspect: "portrait",
  },
  {
    src: "/images/journal/sublime.jpg",
    titleEn: "National Palaces Painting Museum",
    titleTr: "Milli Saraylar Resim Müzesi",
    descEn: "The Romantic hall beside Dolmabahçe.",
    descTr: "Dolmabahçe yanındaki Romantik salon.",
    date: "2024-01-15",
    aspect: "landscape",
  },
  {
    src: "/images/journal/art-nouveau-klimt-jewelry.jpg",
    titleEn: "Golden study",
    titleTr: "Altın etüt",
    descEn: "After Klimt — gold, pattern, figure.",
    descTr: "Klimt'ten sonra — altın, desen, figür.",
    date: "2024-01-08",
    aspect: "portrait",
  },
  {
    src: "/images/journal/paolo-sorrentino-beauty-in-chaos.jpg",
    titleEn: "La Grande Bellezza",
    titleTr: "La Grande Bellezza",
    descEn: "Beauty in the chaos of a Roman morning.",
    descTr: "Bir Roma sabahının kaosunda güzellik.",
    date: "2024-01-02",
    aspect: "portrait",
  },
];

export type LocalizedGalleryItem = {
  src: string;
  title: string;
  desc: string;
  date: string;
  aspect: GalleryAspect;
};

export function getGalleryItems(locale: Locale): LocalizedGalleryItem[] {
  return [...galleryItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((i) => ({
      src: i.src,
      title: locale === "tr" ? i.titleTr : i.titleEn,
      desc: locale === "tr" ? i.descTr : i.descEn,
      date: i.date,
      aspect: i.aspect,
    }));
}
