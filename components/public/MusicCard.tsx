import Image from "next/image";

export function MusicCard({
  eyebrow,
  title,
  artist,
  durationLabel,
  artworkUrl,
  spotifyUrl,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  artist: string;
  durationLabel: string;
  artworkUrl: string | null;
  spotifyUrl: string;
  ctaLabel: string;
}) {
  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-5 border border-rule p-4 transition-colors hover:border-fg"
    >
      <div className="relative h-[72px] w-[72px] flex-none overflow-hidden bg-accent-soft">
        {artworkUrl ? (
          <Image src={artworkUrl} alt="" fill sizes="72px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-small uppercase tracking-[0.16em] text-fg-muted">{eyebrow}</p>
        <p className="mt-1 truncate font-serif text-h3">{title}</p>
        <p className="mt-0.5 truncate text-small text-fg-muted">
          {artist} · {durationLabel}
        </p>
      </div>
      <div className="flex flex-none flex-col items-end gap-2">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full border border-fg text-[11px] transition-colors group-hover:bg-fg group-hover:text-bg"
        >
          ▶
        </span>
        <span className="border-b border-fg pb-px text-small text-fg transition-colors group-hover:border-accent group-hover:text-accent">
          {ctaLabel} →
        </span>
      </div>
    </a>
  );
}
