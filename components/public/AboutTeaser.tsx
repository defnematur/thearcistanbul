import { Container } from "./Container";
import { Link } from "@/lib/i18n/routing";

export function AboutTeaser({
  eyebrow,
  line,
  moreLabel,
}: {
  eyebrow: string;
  line: string;
  moreLabel: string;
}) {
  return (
    <section className="border-t border-rule py-24 md:py-40">
      <Container
        width="gallery"
        className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
          <p className="mt-4 max-w-[28ch] font-serif text-h1">{line}</p>
        </div>
        <Link
          href="/about"
          className="justify-self-start border-b border-fg pb-0.5 text-small text-fg transition-colors hover:border-accent hover:text-accent md:justify-self-end"
        >
          {moreLabel} →
        </Link>
      </Container>
    </section>
  );
}
