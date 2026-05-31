import { Container } from "./Container";
import { Reveal } from "./Reveal";

type Item = { title: string; body: string };

export function EditorialThreeUp({ eyebrow, items }: { eyebrow: string; items: Item[] }) {
  return (
    <section className="border-t border-rule py-24 md:py-40">
      <Container width="gallery">
        <p className="text-small uppercase tracking-[0.18em] text-fg-muted">{eyebrow}</p>
        <div className="mt-12 grid grid-cols-1 gap-12 border-t border-rule pt-12 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <p className="text-small text-fg-muted">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-serif text-h3">{item.title}</h3>
              <p className="mt-3 text-fg-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
