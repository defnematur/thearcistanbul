import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { JournalList } from "@/components/public/JournalList";
import { getArticles } from "@/lib/placeholder/articles";
import type { Locale } from "@/lib/i18n/config";

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journal");
  const articles = getArticles(locale);

  const categoryLabels = {
    essay: t("categories.essay"),
    field: t("categories.field"),
    review: t("categories.review"),
  };

  return (
    <section className="pt-24 md:pt-40">
      <Container width="editorial">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-display">{t("title")}</h1>
        <p className="mt-8 max-w-prose text-fg-muted">{t("lede")}</p>
      </Container>
      <Container width="editorial" className="py-24 md:py-32">
        <JournalList
          articles={articles}
          categoryLabels={categoryLabels}
          locale={locale}
          emptyLabel={t("empty")}
        />
      </Container>
    </section>
  );
}
