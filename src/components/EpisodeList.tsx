import { Star, Calendar, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="space-y-2">
      {episodes.map((episode) => {
        const isSelected = selectedEpisode === episode.number;
        
        return (
          <button
            key={episode.number}
            onClick={() => onSelectEpisode(episode.number)}
            className={cn(
              "w-full text-left group cursor-pointer rounded-xl p-3 transition-all duration-300",
              "liquid-glass-subtle hover:bg-foreground/5",
              "sun-glow moon-glow",
              isSelected && "ring-2 ring-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Episode number badge */}
              <div className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all relative",
                "sun-corona moon-phase-hover",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/50 group-hover:bg-primary/20"
              )}>
                <span className="relative z-10">{episode.number}</span>
              </div>
              
              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-medium text-sm truncate transition-colors",
                    isSelected ? "text-primary" : "group-hover:text-primary"
                  )}>
                    {episode.title || `Episode ${episode.number}`}
                  </h4>
                  
                  {/* Tags */}
                  {episode.filler && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                      Filler
                    </span>
                  )}
                  {episode.recap && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                      Recap
                    </span>
                  )}
                </div>
                
                {/* Metadata row */}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {episode.aired && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(episode.aired).toLocaleDateString()}</span>
                    </div>
                  )}
                  {episode.score && episode.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-primary" />
                      <span className="font-medium">{episode.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Play/Select indicator */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/30 opacity-0 group-hover:opacity-100"
              )}>
                {isSelected ? (
                  <Play className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
