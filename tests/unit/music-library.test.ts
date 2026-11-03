import { describe, expect, it } from "vitest";
import {
  getAlbumsFromPlaylists,
  getAllSongs,
  getArtistsFromPlaylists,
  playlistLabel
} from "@/lib/v2/music/library";
import type { Playlist, PlaylistTrack } from "@/lib/v2/music/types";

function track(id: string, name: string, artist: string, album: string): PlaylistTrack {
  return { id, name, artist, album, albumArt: `art-${album}.jpg`, previewUrl: `${id}.m4a`, duration: 100 };
}

const a1 = track("1", "One", "Artist A", "Album X");
const a2 = track("2", "Two", "Artist A", "Album X");
const a3 = track("3", "Three", "Artist A", "Album Y");
const b1 = track("4", "Four", "Artist B", "Album Z");

const playlists: Playlist[] = [
  { id: "p1", name: "First", emoji: "🎧", coverArt: "", tracks: [a1, a2, b1] },
  { id: "p2", name: "Second", coverArt: "", tracks: [a2, a3] }
];

describe("getAllSongs", () => {
  it("lists each song once in first-seen order", () => {
    expect(getAllSongs(playlists).map((song) => song.id)).toEqual(["1", "2", "4", "3"]);
  });

  it("is empty for no playlists", () => {
    expect(getAllSongs([])).toEqual([]);
  });
});

describe("getAlbumsFromPlaylists", () => {
  it("groups songs by album and artist", () => {
    const albums = getAlbumsFromPlaylists(playlists);
    expect(albums.map((album) => [album.name, album.trackCount])).toEqual([
      ["Album X", 2],
      ["Album Z", 1],
      ["Album Y", 1]
    ]);
    expect(albums[0].tracks.map((song) => song.id)).toEqual(["1", "2"]);
    expect(albums[0].albumArt).toBe("art-Album X.jpg");
  });

  it("keeps same-named albums by different artists apart", () => {
    const other = track("9", "Nine", "Artist C", "Album X");
    expect(getAlbumsFromPlaylists([{ id: "p", name: "p", coverArt: "", tracks: [a1, other] }])).toHaveLength(2);
  });
});

describe("getArtistsFromPlaylists", () => {
  it("counts distinct songs per artist", () => {
    const artists = getArtistsFromPlaylists(playlists);
    expect(artists.map((artist) => [artist.name, artist.trackCount])).toEqual([
      ["Artist A", 3],
      ["Artist B", 1]
    ]);
    expect(artists[0].id).toBe("artist-a");
    expect(artists[0].image).toBe("art-Album X.jpg");
  });
});

describe("playlistLabel", () => {
  it("puts the emoji before the name when there is one", () => {
    expect(playlistLabel(playlists[0])).toBe("🎧 First");
    expect(playlistLabel(playlists[1])).toBe("Second");
  });
});
