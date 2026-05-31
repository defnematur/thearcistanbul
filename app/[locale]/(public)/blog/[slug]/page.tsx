import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { Link } from "@/lib/i18n/routing";
import { ArticleBody } from "@/components/public/ArticleBody";
import { SpotifyTrackCard } from "@/components/public/SpotifyTrackCard";
import { getArticleBySlug, getAllArticleParams } from "@/lib/placeholder/articles";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return getAllArticleParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(locale, slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getArticleBySlug(locale, slug);
  if (!article) notFound();

  const t = await getTranslations("journal");
  const tm = await getTranslations("music");
  const categoryLabel = t(`categories.${article.category}`);
  const langNote = t("langNote");
  const dateLabel = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article.date));

  return (
    <article className="pt-24 md:pt-32">
      <Container width="prose">
        <Link
          href="/blog"
          className="text-small uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-fg"
        >
          ← {t("eyebrow")}
        </Link>
        <div className="mt-10 flex items-center gap-3 text-small text-fg-muted">
          <span className="uppercase tracking-[0.14em]">{categoryLabel}</span>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <time dateTime={article.date}>{dateLabel}</time>
        </div>
        <h1 className="mt-5 font-serif text-display">{article.title}</h1>
        {article.excerpt ? (
          <p className="mt-6 font-serif text-h3 text-fg-muted">{article.excerpt}</p>
        ) : null}
      </Container>

      {article.image ? (
        <Container width="editorial" className="mt-12 md:mt-16">
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-accent-soft">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(min-width: 960px) 960px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container width="prose" className="mt-12 md:mt-16">
        {/* Music card at the top of the post, below the title/cover (CLAUDE.md §4.3). */}
        <SpotifyTrackCard url={article.spotifyUrl} eyebrow={tm("eyebrow")} ctaLabel={tm("cta")} />

        {article.body ? (
          <div className="mt-12 pb-8">
            {langNote ? <p className="mb-8 text-small italic text-fg-muted">{langNote}</p> : null}
            <ArticleBody markdown={article.body} />
          </div>
        ) : null}
      </Container>
    </article>
  );
}
