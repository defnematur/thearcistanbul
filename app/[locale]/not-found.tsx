import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-prose px-6 py-40">
      <p className="text-small text-fg-muted">404</p>
      <h1 className="mt-4 text-h1">Sayfa bulunamadı / Page not found</h1>
      <Link href="/" className="mt-8 inline-block border-b border-fg pb-0.5">
        {t("home")}
      </Link>
    </section>
  );
}
