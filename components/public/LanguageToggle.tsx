"use client";

import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageToggle() {
  const params = useParams<{ locale: Locale }>();
  const pathname = usePathname();
  const t = useTranslations("languageToggle");
  const current = params.locale;
  const other = locales.find((loc) => loc !== current) ?? current;

  function swap(target: Locale) {
    if (!pathname) return `/${target}`;
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  // Single toggle: shows the current locale code (e.g. EN); clicking switches
  // to the other locale (then it reads TR), and vice versa.
  return (
    <a
      href={swap(other)}
      aria-label={`${t("switch")} — ${t(other)}`}
      title={`${t("switch")} — ${t(other)}`}
      className="text-small uppercase tracking-[0.12em] text-fg transition-colors hover:text-accent"
    >
      {current}
    </a>
  );
}
