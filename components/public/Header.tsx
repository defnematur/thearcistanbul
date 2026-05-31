import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Container } from "./Container";
import { LanguageToggle } from "./LanguageToggle";
import { MobileNav } from "./MobileNav";

export function Header() {
  const t = useTranslations("nav");
  return (
    <header className="border-b border-rule">
      <Container width="gallery" className="flex items-center justify-between py-6">
        <Link href="/" className="font-serif text-h3 tracking-tight">
          The Arc Istanbul
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 text-small md:flex">
          <Link href="/" className="text-fg-muted transition-colors hover:text-fg">
            {t("home")}
          </Link>
          <Link href="/about" className="text-fg-muted transition-colors hover:text-fg">
            {t("about")}
          </Link>
          <Link href="/blog" className="text-fg-muted transition-colors hover:text-fg">
            {t("blog")}
          </Link>
          <Link href="/gallery" className="text-fg-muted transition-colors hover:text-fg">
            {t("gallery")}
          </Link>
          <Link href="/contact" className="text-fg-muted transition-colors hover:text-fg">
            {t("contact")}
          </Link>
          <LanguageToggle />
        </nav>
        <MobileNav />
      </Container>
    </header>
  );
}
