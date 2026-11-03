"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { CoverArt } from "../cover-art";
import { cn } from "@/lib/v2/utils";
import type { Playlist, PlaylistTrack } from "@/lib/v2/music/types";
import { playlistLabel } from "@/lib/v2/music/library";
import { useAudio } from "@/lib/v2/music/audio-context";
import { Play, Pause } from "lucide-react";

interface HomeViewProps {
  playlists: Playlist[];
  songs: PlaylistTrack[];
  onPlaylistSelect: (playlistId: string) => void;
  isMobileView: boolean;
}

export function HomeView({
  playlists,
  songs,
  onPlaylistSelect,
  isMobileView,
}: HomeViewProps) {
  const { playbackState, recentlyPlayedTracks, play, pause, resume } = useAudio();

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const isPlayingThisPlaylist =
      playbackState.isPlaying &&
      playbackState.currentTrack &&
      playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);

    if (isPlayingThisPlaylist) {
      pause();
    } else {
      onPlaylistSelect(playlist.id);
      const firstPlayable = playlist.tracks.find((t) => t.previewUrl);
      if (firstPlayable) {
        play(firstPlayable, playlist.tracks);
      }
    }
  };

  const handleRecentTrackPlay = (track: PlaylistTrack) => {
    if (playbackState.currentTrack?.id === track.id && playbackState.isPlaying) {
      pause();
    } else if (playbackState.currentTrack?.id === track.id) {
      resume();
    } else {
      play(track, recentlyPlayedTracks);
    }
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className={cn("p-6", isMobileView && "p-4 pb-20")}>
        {recentlyPlayedTracks.length > 0 && (
          <section className="mb-8" aria-labelledby="recently-played-heading">
            <h2 id="recently-played-heading" className="mb-4 text-lg font-semibold">
              Recently Played
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentlyPlayedTracks.map((song) => {
                const isPlaying =
                  playbackState.isPlaying && playbackState.currentTrack?.id === song.id;
                const action = isPlaying
                  ? "Pause"
                  : playbackState.currentTrack?.id === song.id
                    ? "Resume"
                    : "Play";

                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => handleRecentTrackPlay(song)}
                    disabled={!song.previewUrl}
                    aria-label={`${action} ${song.name} by ${song.artist}`}
                    className={cn(
                      "group w-32 flex-shrink-0 text-left disabled:cursor-default",
                      song.previewUrl && "cursor-pointer"
                    )}
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
                      <CoverArt src={song.albumArt} alt={song.album} />
                      {song.previewUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors can-hover:group-hover:bg-black/40">
                          {isPlaying ? (
                            <Pause className="h-10 w-10 text-white opacity-0 transition-opacity can-hover:group-hover:opacity-100" />
                          ) : (
                            <Play className="h-10 w-10 text-white opacity-0 transition-opacity can-hover:group-hover:opacity-100" />
                          )}
                        </div>
                      )}
                    </div>
                    <p data-recent-track-name className="truncate text-sm font-medium">
                      {song.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Your Playlists - Horizontal Scroll */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Playlists</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {playlists.map((playlist) => {
              const isPlaying =
                playbackState.isPlaying &&
                playbackState.currentTrack &&
                playlist.tracks.some((t) => t.id === playbackState.currentTrack?.id);

              return (
                <div
                  key={playlist.id}
                  onClick={() => onPlaylistSelect(playlist.id)}
                  className="group cursor-pointer flex-shrink-0 w-32"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-muted">
                    {playlist.tracks[0]?.albumArt ? (
                      <CoverArt src={playlist.tracks[0].albumArt} alt={playlistLabel(playlist)} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
                    )}
                    <div
                      className="absolute inset-0 bg-black/0 can-hover:group-hover:bg-black/40 transition-colors flex items-center justify-center"
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Play className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{playlistLabel(playlist)}</p>
                  <p className="text-xs text-muted-foreground">
                    {playlist.tracks.length} songs
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Songs - Horizontal Scroll */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Songs</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {songs.map((song) => {
              const isPlaying =
                playbackState.isPlaying &&
                playbackState.currentTrack?.id === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => song.previewUrl && play(song, songs)}
                  className={cn(
                    "group flex-shrink-0 w-32",
                    song.previewUrl && "cursor-pointer"
                  )}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-muted">
                    <CoverArt src={song.albumArt} alt={song.name} />
                    {song.previewUrl && (
                      <div className="absolute inset-0 bg-black/0 can-hover:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Play className="w-10 h-10 text-white opacity-0 can-hover:group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{song.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
