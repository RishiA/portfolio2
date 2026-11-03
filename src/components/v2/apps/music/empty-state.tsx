import { Music } from "lucide-react";
import { cn } from "@/lib/v2/utils";

interface EmptyStateProps {
  isMobileView: boolean;
}

/** Shown in the content pane when there are no playlists. */
export function EmptyState({ isMobileView }: EmptyStateProps) {
  return (
    <div
      data-testid="music-empty-state"
      className={cn(
        "flex h-full flex-col items-center justify-center px-6 text-center text-muted-foreground",
        isMobileView && "pb-20"
      )}
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
        <Music className="h-9 w-9" />
      </div>
      <p className="text-lg font-semibold text-foreground">No Music Yet</p>
      <p className="mt-1 max-w-xs text-sm">Playlists will show up here once they are added.</p>
    </div>
  );
}
