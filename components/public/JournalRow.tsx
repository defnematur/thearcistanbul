import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import type { LocalizedArticle } from "@/lib/placeholder/articles";

export function JournalRow({
  article,
  categoryLabel,
  locale,
}: {
  article: LocalizedArticle;
  categoryLabel: string;
  locale: Locale;
}) {
  const dateLabel = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article.date));

  return (
    <li className="border-t border-rule last:border-b">
      <Link
        href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
        className="group flex flex-col gap-1.5 py-6 md:grid md:grid-cols-[7rem_1fr_8rem] md:items-baseline md:gap-8 md:py-8"
      >
        <time
          dateTime={article.date}
          className="order-2 text-small text-fg-muted md:order-none"
        >
          {dateLabel}
        </time>
        <h2 className="order-1 font-serif text-h2 transition-colors group-hover:text-accent md:order-none">
          {article.title}
        </h2>
        <span className="order-3 text-small uppercase tracking-[0.14em] text-fg-muted md:order-none md:text-right">
          {categoryLabel}
        </span>
      </Link>
    </li>
  );
}
