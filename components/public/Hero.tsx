import Image from "next/image";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

export function Hero({
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <section className="pt-24 md:pt-40">
      <Container width="gallery">
        <Reveal>
          <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
          <h1 className="mt-6 max-w-[20ch] font-serif text-display">{title}</h1>
          <p className="mt-8 max-w-prose text-fg-muted">{body}</p>
        </Reveal>
      </Container>
      <Container width="gallery" className="mt-16 md:mt-24">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-accent-soft sm:aspect-[16/10]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-top"
          />
        </div>
      </Container>
    </section>
  );
}
