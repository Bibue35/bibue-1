import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { RatingPopover } from "@/components/RatingPopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Plus, Minus, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
];

interface WatchlistStatusProps {
  malId: number;
  mediaType: "anime" | "manga";
  title: string;
  titleJapanese?: string;
  imageUrl?: string;
  score?: number;
  totalEpisodes?: number;
  totalChapters?: number;
}

export function WatchlistStatus({
  malId,
  mediaType,
  title,
  titleJapanese,
  imageUrl,
  score,
  totalEpisodes,
  totalChapters,
}: WatchlistStatusProps) {
  const { user } = useAuth();
  const {
    getWatchlistItem,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    updateScore,
    updateProgress,
  } = useWatchlist();

  const item = getWatchlistItem(malId, mediaType);
  const inWatchlist = isInWatchlist(malId, mediaType);

  if (!user) return null;

  if (!inWatchlist) {
    return (
      <Button
        onClick={() =>
          addToWatchlist.mutate({
            mal_id: malId,
            media_type: mediaType,
            title,
            title_japanese: titleJapanese,
            image_url: imageUrl,
            score,
          })
        }
        disabled={addToWatchlist.isPending}
        className="gap-2 rounded-full"
        size="sm"
      >
        {addToWatchlist.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        Add to Watchlist
      </Button>
    );
  }

  const currentStatus = item?.status || "plan_to_watch";
  const isWatching = currentStatus === "watching";
  const episodesWatched = item?.episodes_watched || 0;
  const chaptersRead = item?.chapters_read || 0;
  const progressField = mediaType === "anime" ? "episodes_watched" : "chapters_read";
  const progressValue = mediaType === "anime" ? episodesWatched : chaptersRead;
  const totalCount = mediaType === "anime" ? totalEpisodes : totalChapters;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={currentStatus}
          onValueChange={(val) =>
            updateStatus.mutate({ mal_id: malId, media_type: mediaType, status: val })
          }
        >
          <SelectTrigger className="h-8 w-auto min-w-[140px] rounded-full text-xs gap-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <RatingPopover
          currentScore={item?.score ? Number(item.score) : null}
          onRate={(s) =>
            updateScore.mutate({ mal_id: malId, media_type: mediaType, score: s })
          }
          size="sm"
        />

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-destructive hover:text-destructive h-7 px-2"
          onClick={() => removeFromWatchlist.mutate({ mal_id: malId, media_type: mediaType })}
        >
          Remove
        </Button>
      </div>

      {/* Progress bar for Watching status */}
      {isWatching && totalCount && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            disabled={progressValue <= 0}
            onClick={() =>
              updateProgress.mutate({
                mal_id: malId,
                media_type: mediaType,
                field: progressField,
                value: Math.max(0, progressValue - 1),
              })
            }
          >
            <Minus className="w-3 h-3" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {mediaType === "anime" ? "Episode" : "Chapter"} {progressValue} of {totalCount}
              </span>
              <span className="text-muted-foreground">
                {totalCount > 0 ? Math.round((progressValue / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (progressValue / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            disabled={progressValue >= totalCount}
            onClick={() =>
              updateProgress.mutate({
                mal_id: malId,
                media_type: mediaType,
                field: progressField,
                value: Math.min(totalCount, progressValue + 1),
              })
            }
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
