import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { Reveal } from "@/components/public/Reveal";
import type { Locale } from "@/lib/i18n/config";

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

      <Container width="editorial" className="mt-14 md:mt-20">
        <div className="relative aspect-[16/9] max-h-[60vh] w-full overflow-hidden bg-accent-soft">
          <Image
            src="/images/home/hero.jpg"
            alt=""
            fill
            sizes="(min-width: 960px) 960px, 100vw"
            className="object-cover"
          />
        </div>
      </Container>

      <Container width="prose" className="py-24 md:py-32">
        <Reveal>
          <div className="space-y-6 text-body">
            <p>{t("body1")}</p>
            <p>{t("body2")}</p>
          </div>
        </Reveal>
      </Container>
    </article>
  );
}
