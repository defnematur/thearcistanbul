import { parseSpotifyUrl, getTrackMeta } from "@/lib/spotify";
import { MusicCard } from "./MusicCard";

/**
 * Server wrapper: parses a Spotify track URL, fetches metadata (client-
 * credentials), and renders the museum MusicCard. Renders nothing if the URL is
 * absent/invalid or metadata is unavailable (e.g. credentials not configured).
 */
export async function SpotifyTrackCard({
  url,
  eyebrow,
  ctaLabel,
}: {
  url: string | null;
  eyebrow: string;
  ctaLabel: string;
}) {
  if (!url) return null;
  const parsed = parseSpotifyUrl(url);
  if (!parsed || parsed.kind !== "track") return null;

  const meta = await getTrackMeta(parsed.id);
  if (!meta) return null;

  return (
    <MusicCard
      eyebrow={eyebrow}
      title={meta.title}
      artist={meta.artist}
      durationLabel={meta.durationLabel}
      artworkUrl={meta.artworkUrl}
      spotifyUrl={meta.spotifyUrl}
      ctaLabel={ctaLabel}
    />
  );
}
