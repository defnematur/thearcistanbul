import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { getGalleryItems, type GalleryAspect } from "@/lib/placeholder/gallery";
import type { Locale } from "@/lib/i18n/config";

const aspectClass: Record<GalleryAspect, string> = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  square: "aspect-square",
};

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const items = getGalleryItems(locale);

  return (
    <section className="pb-32 pt-24 md:pt-40">
      <Container width="prose">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-display">{t("title")}</h1>
        <p className="mt-8 text-fg-muted">{t("lede")}</p>
      </Container>

      <Container width="gallery" className="mt-16 md:mt-24">
        {items.length > 0 ? (
          <div className="gap-8 sm:columns-2 lg:columns-3">
            {items.map((item) => (
              <figure key={item.src} className="mb-12 break-inside-avoid">
                <div
                  className={`relative w-full overflow-hidden bg-accent-soft ${aspectClass[item.aspect]}`}
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-editorial hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="mt-4">
                  <p className="font-serif text-h3">{item.title}</p>
                  <p className="mt-1 text-small text-fg-muted">{item.desc}</p>
                  <time className="mt-1 block text-small text-fg-muted" dateTime={item.date}>
                    {new Intl.DateTimeFormat(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(item.date))}
                  </time>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-fg-muted">{t("empty")}</p>
        )}
      </Container>
    </section>
  );
}
