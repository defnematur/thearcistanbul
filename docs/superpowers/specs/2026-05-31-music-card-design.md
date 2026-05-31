# Music Card Design (per-article Spotify)

**Date:** 2026-05-31
**Status:** Approved (style + approach confirmed via visual brainstorming)

## Goal

A small "now-listening" card on each journal article — Instagram-story vibe but in
the museum aesthetic: square artwork, track title (serif), artist, duration, and a
link to Spotify.

## Decisions

- **Style: Direction B** — custom museum-styled card (hairline frame, cream, serif
  title), *not* the raw Spotify iframe. Chosen over the official embed (A) and the
  rounded "now playing" variant (C).
- **Source: per-article track** — each article carries one `spotifyUrl` (a Spotify
  **track** URL). Lives on the article detail page (top of the post, below the
  title/cover — per CLAUDE.md §4.3).
- **Provider: Spotify**, metadata via the **Web API client-credentials** flow
  (no user login): `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` (free Spotify app,
  user is creating one). Token cached in-process until expiry.
- Playback: the card is static (artwork/artist/duration) and **links out** to
  Spotify. In-page audio (30s preview / full embed) is out of scope for v1 — if
  wanted later, fall back to the official embed.

## Pieces

- `lib/spotify.ts` — `parseSpotifyUrl(url)` (kind+id, regex from CLAUDE.md §4.3),
  `getTrackMeta(id)` (client-credentials fetch → `{ title, artist, durationMs,
  artworkUrl, spotifyUrl }`), `formatDuration(ms)`. **Guarded**: if creds are
  absent, `getTrackMeta` returns `null` and the card simply doesn't render
  (same pattern as the guarded Resend contact action).
- `components/public/MusicCard.tsx` — presentational (props = track meta), museum
  styling, `next/image` artwork (Spotify art is on `i.scdn.co`, already allowed by
  CSP `img-src`).
- `components/public/SpotifyTrackCard.tsx` — server wrapper: parse `spotifyUrl` →
  fetch meta → render `MusicCard`, or render nothing.
- Placeholder data: add optional `spotifyUrl` per article.
- Env: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` in `.env.example`.

## Dependencies / sequencing

- **Needs the article detail page** (`/[locale]/blog/[slug]`, not built yet) to
  have a home — built in the blog plan. Until then the component is demoed in
  isolation.
- **Needs the user's Spotify Client ID/Secret** for real metadata. Until then the
  card renders from mock data (demo) or not at all (guarded null).

## Admin

Editor pastes a Spotify track URL per article (`spotifyUrl` field). The admin's
`SpotifyPreview` should preview this custom card. Recorded in the admin plan
addendum (2026-05-31).
