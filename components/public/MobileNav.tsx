"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { LanguageToggle } from "./LanguageToggle";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  // Lock background scroll and close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-mr-2 flex h-11 w-11 flex-col items-end justify-center gap-1.5"
      >
        <span className="block h-px w-6 bg-fg" />
        <span className="block h-px w-6 bg-fg" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-rule px-6 py-6">
            <span className="font-serif text-h3 tracking-tight">The Arc Istanbul</span>
            <button
              type="button"
              aria-label={t("close")}
              onClick={close}
              className="-mr-2 flex h-11 items-center px-2 text-small uppercase tracking-wider text-fg-muted transition-colors hover:text-fg"
            >
              {t("close")}
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col px-6 py-6">
            <Link
              href="/about"
              onClick={close}
              className="border-b border-rule py-5 font-serif text-h2"
            >
              {t("about")}
            </Link>
            <Link
              href="/blog"
              onClick={close}
              className="border-b border-rule py-5 font-serif text-h2"
            >
              {t("blog")}
            </Link>
            <Link
              href="/contact"
              onClick={close}
              className="border-b border-rule py-5 font-serif text-h2"
            >
              {t("contact")}
            </Link>
            <div className="pt-10">
              <LanguageToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
