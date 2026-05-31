import { parseSpotifyUrl } from "@/lib/spotify";

/**
 * Renders Spotify's official embed player for a track/playlist URL, framed with
 * a small editorial label. The embed plays in-page (30s preview, or the full
 * track for visitors logged into Spotify). Renders nothing for an absent/invalid
 * URL. No Web API call needed — the embed carries its own artwork/metadata.
 */
export function SpotifyTrackCard({ url, eyebrow }: { url: string | null; eyebrow: string }) {
  if (!url) return null;
  const parsed = parseSpotifyUrl(url);
  if (!parsed) return null;

  const src = `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}`;
  const height = parsed.kind === "track" || parsed.kind === "episode" ? 152 : 352;

  return (
    <figure className="overflow-hidden">
      <figcaption className="mb-3 text-small uppercase tracking-[0.16em] text-fg-muted">
        {eyebrow}
      </figcaption>
      <iframe
        src={src}
        width="100%"
        height={height}
        allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify"
        className="block rounded-xl"
        style={{ border: 0 }}
      />
    </figure>
  );
}
