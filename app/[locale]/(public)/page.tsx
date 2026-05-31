import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-editorial px-6 py-40">
      <h1 className="text-display">The Arc Istanbul</h1>
      <p className="mt-8 text-fg-muted">{t("home")} — placeholder</p>
    </section>
  );
}
