import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Container } from "./Container";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-40 border-t border-rule">
      <Container width="gallery" className="grid grid-cols-2 gap-12 py-20 md:grid-cols-4">
        <div>
          <p className="font-serif text-h3">{t("tagline")}</p>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("quickLinks")}</p>
          <ul className="mt-4 space-y-2 text-small">
            <li>
              <Link href="/" className="hover:text-accent">
                {tNav("home")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent">
                {tNav("about")}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-accent">
                {tNav("blog")}
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-accent">
                {tNav("gallery")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent">
                {tNav("contact")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("policies")}</p>
          <ul className="mt-4 space-y-2 text-small text-fg-muted">
            <li>—</li>
          </ul>
        </div>
        <div>
          <p className="text-small uppercase tracking-wider text-fg-muted">{t("contact")}</p>
          <p className="mt-4 text-small text-fg-muted">İstanbul, Türkiye</p>
        </div>
      </Container>
      <Container
        width="gallery"
        className="flex justify-between border-t border-rule py-8 text-small text-fg-muted"
      >
        <span>© {year} The Arc Istanbul</span>
        <span>{t("rights")}</span>
      </Container>
    </footer>
  );
}
