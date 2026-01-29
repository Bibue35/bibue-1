import { Star, Calendar, Play } from "lucide-react";
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
    <div className="space-y-3">
      {episodes.map((episode) => (
        <button
          key={episode.number}
          onClick={() => onSelectEpisode(episode.number)}
          className={cn(
            "episode-card w-full text-left group cursor-pointer",
            selectedEpisode === episode.number && "ring-2 ring-primary/50"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Episode number badge */}
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
                selectedEpisode === episode.number
                  ? "bg-primary text-primary-foreground"
                  : "liquid-glass-subtle group-hover:bg-primary/20"
              )}>
                {episode.number}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {episode.title || `Episode ${episode.number}`}
                </h4>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {episode.aired && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(episode.aired).toLocaleDateString()}</span>
                    </div>
                  )}
                  {episode.score && episode.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{episode.score.toFixed(1)}</span>
                    </div>
                  )}
                  {episode.filler && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Filler
                    </span>
                  )}
                  {episode.recap && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Recap
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Play indicator */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full liquid-glass-subtle flex items-center justify-center">
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
