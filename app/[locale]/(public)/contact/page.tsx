import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { ContactForm } from "@/components/public/ContactForm";
import type { Locale } from "@/lib/i18n/config";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="pb-32 pt-24 md:pt-40">
      <Container width="prose" className="text-center">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{t("eyebrow")}</p>
        <h1 className="mt-6 font-serif text-display">{t("title")}</h1>
        <p className="mx-auto mt-8 max-w-prose text-fg-muted">{t("lede")}</p>
      </Container>

      <Container width="prose" className="mt-16">
        <div className="mx-auto max-w-[520px]">
          <ContactForm />
          <p className="mt-14 text-center text-small text-fg-muted">
            {t("address.city")}, {t("address.country")} · {t("email")}
          </p>
        </div>
      </Container>
    </section>
  );
}
