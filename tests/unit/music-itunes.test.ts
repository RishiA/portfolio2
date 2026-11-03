import { describe, expect, it, vi } from "vitest";
import lookupFixture from "./fixtures/itunes-lookup.json";
import {
  lookupSongs,
  mapSongToTrack,
  parseLookupResponse,
  resolvePlaylists,
  upscaleArtwork
} from "@/lib/v2/music/itunes";

const RICK_URL = "https://music.apple.com/us/album/never-gonna-give-you-up/1773292758?i=1773293184";
const JACK_URL = "https://music.apple.com/us/song/banana-pancakes/1440857795";

function fixtureFetch() {
  return vi.fn(async () => new Response(JSON.stringify(lookupFixture), { status: 200 })) as unknown as typeof fetch & {
    mock: { calls: unknown[][] };
  };
}

describe("upscaleArtwork", () => {
  it("asks for 600x600 instead of 100x100", () => {
    expect(upscaleArtwork("https://is1-ssl.mzstatic.com/image/thumb/a/b.jpg/100x100bb.jpg")).toBe(
      "https://is1-ssl.mzstatic.com/image/thumb/a/b.jpg/600x600bb.jpg"
    );
  });

  it("leaves URLs without a size suffix alone", () => {
    expect(upscaleArtwork("https://example.com/art")).toBe("https://example.com/art");
  });
});

describe("parseLookupResponse", () => {
  it("keeps the song rows from a recorded response", () => {
    const songs = parseLookupResponse(lookupFixture);
    expect(songs.map((song) => song.trackId)).toEqual([1773293184, 1440857795]);
  });

  it("drops malformed rows and malformed envelopes", () => {
    expect(parseLookupResponse({ results: [{ trackId: "nope" }, { trackId: 7, trackName: "ok" }] })).toHaveLength(1);
    expect(parseLookupResponse({ nothing: true })).toEqual([]);
    expect(parseLookupResponse(null)).toEqual([]);
  });
});

describe("mapSongToTrack", () => {
  const [rick] = parseLookupResponse(lookupFixture);

  it("maps a recorded row to the app's track shape", () => {
    expect(mapSongToTrack(rick)).toEqual({
      id: "1773293184",
      name: "Never Gonna Give You Up",
      artist: "Rick Astley",
      album: "The Best Of Me: Never Edition",
      albumArt: expect.stringMatching(/\/600x600bb\.jpg$/),
      previewUrl: expect.stringContaining("audio-ssl.itunes.apple.com"),
      duration: 214
    });
  });

  it("uses null when there is no preview", () => {
    expect(mapSongToTrack({ trackId: 1, trackName: "x" }).previewUrl).toBeNull();
  });

  it("applies title and artist overrides", () => {
    const track = mapSongToTrack(rick, { appleMusicUrl: RICK_URL, title: "Rickroll", artist: "R. A." });
    expect(track.name).toBe("Rickroll");
    expect(track.artist).toBe("R. A.");
  });
});

describe("lookupSongs", () => {
  it("batches ids into one request and indexes songs by id", async () => {
    const fetchImpl = fixtureFetch();
    const songs = await lookupSongs(["1773293184", "1440857795"], "us", fetchImpl);
    expect(fetchImpl.mock.calls).toHaveLength(1);
    expect(String(fetchImpl.mock.calls[0][0])).toContain("id=1773293184,1440857795");
    expect(String(fetchImpl.mock.calls[0][0])).toContain("entity=song");
    expect([...songs.keys()]).toEqual(["1773293184", "1440857795"]);
  });

  it("splits large lists into several requests", async () => {
    const fetchImpl = fixtureFetch();
    const ids = Array.from({ length: 250 }, (_, index) => String(index + 1));
    await lookupSongs(ids, "us", fetchImpl);
    expect(fetchImpl.mock.calls).toHaveLength(3);
  });

  it("returns nothing when the request fails", async () => {
    const failing = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    expect((await lookupSongs(["1"], "us", failing)).size).toBe(0);

    const badStatus = vi.fn(async () => new Response("no", { status: 503 })) as unknown as typeof fetch;
    expect((await lookupSongs(["1"], "us", badStatus)).size).toBe(0);
  });
});

describe("resolvePlaylists", () => {
  it("builds playlists from entries using one lookup for all of them", async () => {
    const fetchImpl = fixtureFetch();
    const playlists = await resolvePlaylists(
      [
        { id: "a", name: "Road Trip", emoji: "🚗", description: "Windows down", tracks: [{ appleMusicUrl: RICK_URL }, { appleMusicUrl: JACK_URL }] },
        { id: "b", name: "Quiet", tracks: [{ appleMusicUrl: JACK_URL }] }
      ],
      fetchImpl
    );

    expect(fetchImpl.mock.calls).toHaveLength(1);
    expect(playlists).toHaveLength(2);
    expect(playlists[0]).toMatchObject({ id: "a", name: "Road Trip", emoji: "🚗", description: "Windows down" });
    expect(playlists[0].tracks.map((track) => track.name)).toEqual(["Never Gonna Give You Up", "Banana Pancakes"]);
    expect(playlists[0].coverArt).toMatch(/600x600bb\.jpg$/);
    expect(playlists[1].tracks[0].id).toBe("1440857795");
  });

  it("keeps a track without a preview but plays nothing", async () => {
    const withoutPreview = {
      resultCount: 1,
      results: [{ ...lookupFixture.results[0], previewUrl: undefined }]
    };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(withoutPreview))) as unknown as typeof fetch;
    const [playlist] = await resolvePlaylists([{ id: "a", name: "A", tracks: [{ appleMusicUrl: RICK_URL }] }], fetchImpl);
    expect(playlist.tracks).toHaveLength(1);
    expect(playlist.tracks[0].previewUrl).toBeNull();
  });

  it("skips invalid links and repeated songs", async () => {
    const [playlist] = await resolvePlaylists(
      [
        {
          id: "a",
          name: "A",
          tracks: [{ appleMusicUrl: "https://example.com/x" }, { appleMusicUrl: RICK_URL }, { appleMusicUrl: RICK_URL }]
        }
      ],
      fixtureFetch()
    );
    expect(playlist.tracks).toHaveLength(1);
  });

  it("keeps an unresolved track only when it has a title override", async () => {
    const failing = vi.fn(async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
    const [playlist] = await resolvePlaylists(
      [
        {
          id: "a",
          name: "A",
          tracks: [{ appleMusicUrl: RICK_URL, title: "Named" }, { appleMusicUrl: JACK_URL }]
        }
      ],
      failing
    );
    expect(playlist.tracks).toEqual([
      { id: "1773293184", name: "Named", artist: "Unknown Artist", album: "Single", albumArt: "", previewUrl: null, duration: 0 }
    ]);
    expect(playlist.coverArt).toBe("");
  });

  it("returns an empty playlist list for no entries without any request", async () => {
    const fetchImpl = fixtureFetch();
    expect(await resolvePlaylists([], fetchImpl)).toEqual([]);
    expect(fetchImpl.mock.calls).toHaveLength(0);
  });
});
