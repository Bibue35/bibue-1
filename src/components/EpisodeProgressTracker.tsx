import { useState, useMemo, useCallback } from "react";
import { Check, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EpisodeProgressTrackerProps {
  malId: number;
  totalEpisodes: number;
  animeTitle: string;
}

export function EpisodeProgressTracker({
  malId,
  totalEpisodes,
  animeTitle,
}: EpisodeProgressTrackerProps) {
  const { user } = useAuth();
  const { getWatchlistItem, updateProgress } = useWatchlist();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const item = getWatchlistItem(malId, "anime");
  const watched = item?.episodes_watched || 0;
  const percent = totalEpisodes > 0 ? Math.round((watched / totalEpisodes) * 100) : 0;

  const handleMarkUpTo = useCallback(
    (epNum: number) => {
      if (!item) return;
      updateProgress.mutate({
        mal_id: malId,
        media_type: "anime",
        field: "episodes_watched",
        value: epNum,
      });
      updateProgress.mutate({
        mal_id: malId,
        media_type: "anime",
        field: "last_episode_watched",
        value: epNum,
      });
      toast({
        title: `${animeTitle}: Episode ${epNum} of ${totalEpisodes} ✓`,
      });
    },
    [malId, item, animeTitle, totalEpisodes, updateProgress, toast]
  );

  const handleToggleEpisode = useCallback(
    (epNum: number) => {
      if (!item) return;
      // If clicking the last watched episode, unmark it
      if (epNum === watched) {
        handleMarkUpTo(epNum - 1);
      } else {
        // Mark all up to this episode
        handleMarkUpTo(epNum);
      }
    },
    [watched, item, handleMarkUpTo]
  );

  if (!user || !item) return null;

  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
        {/* Progress Summary */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {watched} of {totalEpisodes} episodes ({percent}%)
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              {isOpen ? "Hide" : "Track Episodes"}
              {isOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Progress Bar */}
        <Progress value={percent} className="h-2 mb-1" />

        <CollapsibleContent>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Click an episode to mark all episodes up to it as watched.
            </p>
            {/* Episode Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
              {episodes.map((ep) => {
                const isWatched = ep <= watched;
                return (
                  <button
                    key={ep}
                    onClick={() => handleToggleEpisode(ep)}
                    className={cn(
                      "relative flex items-center justify-center h-9 rounded-md text-xs font-medium transition-all border",
                      isWatched
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-muted/40 border-border/30 text-muted-foreground hover:bg-muted hover:border-border"
                    )}
                    title={
                      isWatched
                        ? `Unmark episode ${ep}`
                        : `Mark episodes 1-${ep} as watched`
                    }
                  >
                    {isWatched && (
                      <Check className="w-3 h-3 absolute top-0.5 right-0.5 text-primary" />
                    )}
                    {ep}
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
