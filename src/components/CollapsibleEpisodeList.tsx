import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Episode {
  number: number;
  title: string;
  thumbnail?: string;
}

interface CollapsibleEpisodeListProps {
  episodes: Episode[];
  selectedEpisode: number;
  onSelectEpisode: (episode: number) => void;
  animeTitle?: string;
  totalEpisodes?: number;
}

export function CollapsibleEpisodeList({
  episodes,
  selectedEpisode,
  onSelectEpisode,
  animeTitle,
  totalEpisodes,
}: CollapsibleEpisodeListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentEpisode = episodes.find(ep => ep.number === selectedEpisode);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      {/* Trigger - Always visible bottom bar */}
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-black/80 backdrop-blur-sm hover:bg-black/90 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 text-primary flex-shrink-0">
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span className="text-xs sm:text-sm font-medium">EP {selectedEpisode}</span>
            </div>
            <div className="h-3 sm:h-4 w-px bg-white/20" />
            <h2 className="text-white font-medium text-xs sm:text-sm md:text-base truncate">
              {animeTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-white/50 text-[10px] sm:text-xs md:text-sm">
              {selectedEpisode}/{totalEpisodes || episodes.length}
            </span>
            <ChevronDown 
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 text-white/70 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Content - Episode Grid */}
      <CollapsibleContent className="bg-black/90 backdrop-blur-md">
        <div className="relative px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {/* Episode Carousel */}
          <div className="relative group">
            {/* Scroll Left Button - Hidden on mobile, visible on hover for desktop */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/80 hover:bg-black rounded-full hidden sm:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                const container = document.getElementById('episode-carousel-collapsible');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Episodes */}
            <div 
              id="episode-carousel-collapsible"
              className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3 sm:mx-0 sm:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {episodes.map((ep) => {
                const isPlaying = selectedEpisode === ep.number;
                const isWatched = ep.number < selectedEpisode;
                
                return (
                  <button
                    key={ep.number}
                    onClick={() => {
                      onSelectEpisode(ep.number);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex-shrink-0 w-28 sm:w-32 md:w-40 group/card text-left rounded-md sm:rounded-lg overflow-hidden transition-all duration-200",
                      isPlaying 
                        ? "ring-2 ring-primary scale-105" 
                        : "hover:ring-1 hover:ring-white/30"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-black/50">
                      {ep.thumbnail && (
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          className={cn(
                            "w-full h-full object-cover transition-all",
                            isWatched && "opacity-60"
                          )}
                        />
                      )}
                      
                      {/* Now Playing Badge */}
                      {isPlaying && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1">
                            <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
                            <span className="hidden xs:inline">NOW </span>PLAYING
                          </div>
                        </div>
                      )}
                      
                      {/* Play overlay on hover - hidden on mobile */}
                      {!isPlaying && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Watched indicator */}
                      {isWatched && (
                        <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 p-0.5 rounded-full bg-primary/80">
                          <Eye className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                        </div>
                      )}
                      
                      {/* Episode number badge */}
                      <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-black/70 text-white text-[8px] sm:text-[10px] font-bold px-0.5 sm:px-1 py-0.5 rounded">
                        E{ep.number}
                      </div>
                    </div>
                    
                    {/* Episode title */}
                    <div className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-black/60">
                      <p className={cn(
                        "text-[9px] sm:text-[10px] md:text-xs font-medium truncate",
                        isPlaying ? "text-primary" : "text-white/80"
                      )}>
                        {ep.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button - Hidden on mobile */}
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/80 hover:bg-black rounded-full hidden sm:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                const container = document.getElementById('episode-carousel-collapsible');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
