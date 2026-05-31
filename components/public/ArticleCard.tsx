import Image from "next/image";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import type { LocalizedArticle } from "@/lib/placeholder/articles";

export function ArticleCard({
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
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
      className="group block"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-accent-soft">
        {article.image ? (
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 ease-editorial group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-3 text-small text-fg-muted">
        <span className="uppercase tracking-[0.14em]">{categoryLabel}</span>
        <span aria-hidden className="text-rule">
          ·
        </span>
        <time dateTime={article.date}>{dateLabel}</time>
      </div>
      <h3 className="mt-2 font-serif text-h3 transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-2 text-small text-fg-muted">{article.excerpt}</p>
    </Link>
  );
}
