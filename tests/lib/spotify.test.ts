import { describe, it, expect } from "vitest";
import { parseSpotifyUrl, formatDuration } from "@/lib/spotify";

describe("parseSpotifyUrl", () => {
  it("parses a track URL", () => {
    expect(parseSpotifyUrl("https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8")).toEqual({
      kind: "track",
      id: "4PTG3Z6ehGkBFwjybzWkR8",
    });
  });

  it("parses with query params and other kinds", () => {
    expect(parseSpotifyUrl("https://open.spotify.com/playlist/abc123?si=x")).toEqual({
      kind: "playlist",
      id: "abc123",
    });
  });

  it("rejects non-Spotify or malformed URLs", () => {
    expect(parseSpotifyUrl("https://example.com/track/abc")).toBeNull();
    expect(parseSpotifyUrl("not a url")).toBeNull();
    expect(parseSpotifyUrl("http://open.spotify.com/track/abc")).toBeNull();
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [5000, "0:05"],
    [65000, "1:05"],
    [357000, "5:57"],
  ])("formatDuration(%i) → %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
