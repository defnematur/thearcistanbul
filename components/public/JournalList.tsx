import type { Locale } from "@/lib/i18n/config";
import type { ArticleCategory, LocalizedArticle } from "@/lib/placeholder/articles";
import { JournalRow } from "./JournalRow";

export function JournalList({
  articles,
  categoryLabels,
  locale,
  emptyLabel,
}: {
  articles: LocalizedArticle[];
  categoryLabels: Record<ArticleCategory, string>;
  locale: Locale;
  emptyLabel: string;
}) {
  if (articles.length === 0) {
    return <p className="text-fg-muted">{emptyLabel}</p>;
  }
  return (
    <ul>
      {articles.map((article) => (
        <JournalRow
          key={article.slug}
          article={article}
          categoryLabel={categoryLabels[article.category]}
          locale={locale}
        />
      ))}
    </ul>
  );
}
