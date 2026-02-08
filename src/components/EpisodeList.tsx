import { Star, Calendar, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpandTransition } from "./ExpandTransition";

interface Episode {
  number: number;
  title?: string;
  aired?: string;
  score?: number;
  filler?: boolean;
  recap?: boolean;
}

interface EpisodeListProps {
  episodes: Episode[];
  selectedEpisode: number;
  onSelectEpisode: (episode: number) => void;
  animeTitle?: string;
}

export function EpisodeList({ episodes, selectedEpisode, onSelectEpisode, animeTitle }: EpisodeListProps) {
  const { trigger, overlay } = useExpandTransition(() => {
    if (pendingEpisode.current !== null) {
      onSelectEpisode(pendingEpisode.current);
      pendingEpisode.current = null;
    }
  });
  const pendingEpisode = { current: null as number | null };

  return (
    <div className="space-y-1 sm:space-y-2">
      {overlay}
      {episodes.map((episode) => {
        const isSelected = selectedEpisode === episode.number;
        
        return (
          <button
            key={episode.number}
            onClick={(e) => {
              pendingEpisode.current = episode.number;
              trigger(e);
            }}
            className={cn(
              "w-full text-left group cursor-pointer rounded-lg sm:rounded-xl transition-all duration-200",
              "px-2.5 py-2 sm:p-3",
              "active:scale-[0.98]",
              "liquid-glass-subtle hover:bg-foreground/5",
              isSelected
                ? "ring-1.5 ring-primary bg-primary/5"
                : "active:bg-foreground/5"
            )}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Episode number — compact circle on mobile */}
              <div className={cn(
                "flex-shrink-0 rounded-lg flex items-center justify-center font-bold transition-all",
                "w-9 h-9 text-sm sm:w-11 sm:h-11 sm:text-base sm:rounded-xl",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 group-hover:bg-primary/20 group-active:bg-primary/20"
              )}>
                {episode.number}
              </div>
              
              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h4 className={cn(
                    "font-medium text-[13px] sm:text-sm truncate transition-colors leading-tight",
                    isSelected ? "text-primary" : "group-hover:text-primary"
                  )}>
                    {episode.title || `Episode ${episode.number}`}
                  </h4>
                  
                  {/* Tags — inline pills */}
                  {episode.filler && (
                    <span className="px-1 py-px rounded text-[9px] sm:text-[10px] font-medium bg-muted text-muted-foreground flex-shrink-0">
                      Filler
                    </span>
                  )}
                  {episode.recap && (
                    <span className="px-1 py-px rounded text-[9px] sm:text-[10px] font-medium bg-muted text-muted-foreground flex-shrink-0">
                      Recap
                    </span>
                  )}
                </div>
                
                {/* Metadata — tighter spacing */}
                <div className="flex items-center gap-2 sm:gap-3 mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                  {episode.aired && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{new Date(episode.aired).toLocaleDateString()}</span>
                    </div>
                  )}
                  {episode.score && episode.score > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current text-primary" />
                      <span className="font-medium">{episode.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Play indicator — always visible on mobile */}
              <div className={cn(
                "flex-shrink-0 rounded-full flex items-center justify-center transition-all",
                "w-7 h-7 sm:w-8 sm:h-8",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/30 sm:opacity-0 sm:group-hover:opacity-100"
              )}>
                {isSelected ? (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
