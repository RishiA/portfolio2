import { describe, expect, it } from "vitest";
import { parseAppleMusicTrackId, parseAppleMusicTrackRef } from "@/lib/v2/music/apple-music-url";

describe("parseAppleMusicTrackRef", () => {
  it("reads the song id from an album link with ?i=", () => {
    expect(
      parseAppleMusicTrackRef("https://music.apple.com/us/album/never-gonna-give-you-up/1773292758?i=1773293184")
    ).toEqual({ trackId: "1773293184", storefront: "us" });
  });

  it("ignores extra query parameters", () => {
    expect(parseAppleMusicTrackId("https://music.apple.com/gb/album/x/1?i=22&uo=4")).toBe("22");
  });

  it("reads the trailing id of a song link", () => {
    expect(parseAppleMusicTrackRef("https://music.apple.com/us/song/banana-pancakes/1440857795")).toEqual({
      trackId: "1440857795",
      storefront: "us"
    });
  });

  it("defaults the storefront to us when the link has none", () => {
    expect(parseAppleMusicTrackRef("https://music.apple.com/song/banana-pancakes/1440857795")).toEqual({
      trackId: "1440857795",
      storefront: "us"
    });
  });

  it("lowercases the storefront", () => {
    expect(parseAppleMusicTrackRef("https://music.apple.com/FR/song/chanson/55")?.storefront).toBe("fr");
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseAppleMusicTrackId("  https://music.apple.com/us/song/a/5  ")).toBe("5");
  });

  it("rejects an album link with no song", () => {
    expect(parseAppleMusicTrackId("https://music.apple.com/us/album/in-between-dreams/1440857781")).toBeNull();
  });

  it("rejects a non-numeric song id", () => {
    expect(parseAppleMusicTrackId("https://music.apple.com/us/album/x/1?i=abc")).toBeNull();
  });

  it("rejects links on other hosts, other schemes and other paths", () => {
    expect(parseAppleMusicTrackId("https://example.com/us/song/a/1")).toBeNull();
    expect(parseAppleMusicTrackId("https://music.apple.com.evil.test/us/song/a/1")).toBeNull();
    expect(parseAppleMusicTrackId("http://music.apple.com/us/song/a/1")).toBeNull();
    expect(parseAppleMusicTrackId("https://music.apple.com/us/playlist/a/pl.123?i=1")).toBeNull();
    expect(parseAppleMusicTrackId("https://music.apple.com/us/song/")).toBeNull();
  });

  it("rejects text that is not a URL", () => {
    expect(parseAppleMusicTrackId("banana pancakes")).toBeNull();
    expect(parseAppleMusicTrackId("")).toBeNull();
  });
});
