import Image from "next/image";
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
        className="group grid grid-cols-1 gap-5 py-8 md:grid-cols-[15rem_1fr] md:gap-10 md:py-10"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-accent-soft">
          {article.image ? (
            <Image
              src={article.image}
              alt=""
              fill
              sizes="(min-width: 768px) 240px, 100vw"
              className="object-cover transition-transform duration-300 ease-editorial group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <div className="flex flex-col md:py-1">
          <div className="flex items-center gap-3 text-small text-fg-muted">
            <span className="uppercase tracking-[0.14em]">{categoryLabel}</span>
            <span aria-hidden className="text-rule">
              ·
            </span>
            <time dateTime={article.date}>{dateLabel}</time>
          </div>
          <h2 className="mt-3 font-serif text-h2 transition-colors group-hover:text-accent">
            {article.title}
          </h2>
          <p className="mt-3 max-w-prose text-fg-muted">{article.excerpt}</p>
        </div>
      </Link>
    </li>
  );
}
