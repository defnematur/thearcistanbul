"use client";

import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageToggle() {
  const params = useParams<{ locale: Locale }>();
  const pathname = usePathname();
  const t = useTranslations("languageToggle");
  const current = params.locale;

  function swap(target: Locale) {
    if (!pathname) return `/${target}`;
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  return (
    <div aria-label={t("label")} className="flex items-center gap-3 text-small">
      {locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="text-rule">
              /
            </span>
          )}
          <a
            href={swap(loc)}
            aria-current={loc === current ? "page" : undefined}
            className={loc === current ? "text-fg" : "text-fg-muted hover:text-fg"}
          >
            {t(loc)}
          </a>
        </span>
      ))}
    </div>
  );
}
