"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { CoverArt } from "../cover-art";
import { cn } from "@/lib/v2/utils";
import { ScrollArea } from "../scroll-area";
import type { Artist } from "@/lib/v2/music/types";

interface ArtistsViewProps {
  artists: Artist[];
  isMobileView: boolean;
}

export function ArtistsView({ artists, isMobileView }: ArtistsViewProps) {
  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6", isMobileView && "p-4 pb-20")}>
        <div>
          {!isMobileView && <h2 className="text-lg font-semibold mb-4">Artists</h2>}
          <div
            className={cn(
              "grid gap-6",
              isMobileView ? "grid-cols-2" : "grid-cols-4 desktop:grid-cols-6"
            )}
          >
            {artists.map((artist) => (
              <div key={artist.id} className="text-center">
                <div className="relative aspect-square rounded-full overflow-hidden mb-3 bg-muted mx-auto">
                  <CoverArt src={artist.image} alt={artist.name} />
                </div>
                <p className="text-sm font-medium truncate">{artist.name}</p>
                <p className="text-xs text-muted-foreground">
                  {artist.trackCount} {artist.trackCount === 1 ? "song" : "songs"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
