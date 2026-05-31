export type SpotifyKind = "track" | "album" | "playlist" | "episode";

const SPOTIFY_URL =
  /^https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(\?.*)?$/;

export function parseSpotifyUrl(url: string): { kind: SpotifyKind; id: string } | null {
  const m = url.match(SPOTIFY_URL);
  if (!m) return null;
  return { kind: m[1] as SpotifyKind, id: m[2]! };
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export type TrackMeta = {
  title: string;
  artist: string;
  durationMs: number;
  durationLabel: string;
  artworkUrl: string | null;
  spotifyUrl: string;
};

// Server-only by usage (never import into a Client Component). Uses the Spotify
// Web API client-credentials flow — no user login. Guarded: without credentials
// it returns null and the card simply doesn't render.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(now: number): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (cachedToken && cachedToken.expiresAt > now + 5_000) return cachedToken.value;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: now + json.expires_in * 1000 };
  return cachedToken.value;
}

export async function getTrackMeta(id: string, now = Date.now()): Promise<TrackMeta | null> {
  const token = await getToken(now);
  if (!token) return null;

  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 86_400 },
  });
  if (!res.ok) return null;

  const t = (await res.json()) as {
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: { images: { url: string }[] };
    external_urls: { spotify: string };
  };

  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    durationMs: t.duration_ms,
    durationLabel: formatDuration(t.duration_ms),
    artworkUrl: t.album.images?.[0]?.url ?? null,
    spotifyUrl: t.external_urls.spotify,
  };
}
