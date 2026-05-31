import { Container } from "./Container";
import { Link } from "@/lib/i18n/routing";
import { Reveal } from "./Reveal";
import { ArticleCard } from "./ArticleCard";
import type { Locale } from "@/lib/i18n/config";
import type { ArticleCategory, LocalizedArticle } from "@/lib/placeholder/articles";

export function ArticleGrid({
  eyebrow,
  allLabel,
  articles,
  categoryLabels,
  locale,
}: {
  eyebrow: string;
  allLabel: string;
  articles: LocalizedArticle[];
  categoryLabels: Record<ArticleCategory, string>;
  locale: Locale;
}) {
  return (
    <section className="py-24 md:py-40">
      <Container width="gallery">
        <div className="flex items-baseline justify-between border-b border-rule pb-6">
          <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
          <Link
            href="/blog"
            className="border-b border-fg pb-0.5 text-small text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {allLabel} →
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80}>
              <ArticleCard
                article={article}
                categoryLabel={categoryLabels[article.category]}
                locale={locale}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
