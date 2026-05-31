import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/public/Hero";
import { ArticleGrid } from "@/components/public/ArticleGrid";
import { EditorialThreeUp } from "@/components/public/EditorialThreeUp";
import { AboutTeaser } from "@/components/public/AboutTeaser";
import { getArticles } from "@/lib/placeholder/articles";
import type { Locale } from "@/lib/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tj = await getTranslations("journal");
  const articles = getArticles(locale, 3);

  const categoryLabels = {
    essay: tj("categories.essay"),
    field: tj("categories.field"),
    review: tj("categories.review"),
  };

  return (
    <>
      <Hero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        body={t("heroBody")}
        imageSrc="/images/home/hero.jpg"
        imageAlt=""
      />
      <ArticleGrid
        eyebrow={t("recentEyebrow")}
        allLabel={t("recentAll")}
        articles={articles}
        categoryLabels={categoryLabels}
        locale={locale}
      />
      <EditorialThreeUp
        eyebrow={t("behindEyebrow")}
        items={[
          { title: t("behind.one.title"), body: t("behind.one.body") },
          { title: t("behind.two.title"), body: t("behind.two.body") },
          { title: t("behind.three.title"), body: t("behind.three.body") },
        ]}
      />
      <AboutTeaser eyebrow={t("aboutEyebrow")} line={t("aboutLine")} moreLabel={t("aboutMore")} />
    </>
  );
}
