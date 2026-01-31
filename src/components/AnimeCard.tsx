import { useState } from "react";
import { Star, Calendar, Play } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimeDetailModal } from "./AnimeDetailModal";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
}

export function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Format aired date
  const getAiredInfo = () => {
    if (anime.aired?.from) {
      const date = new Date(anime.aired.from);
      return date.getFullYear().toString();
    }
    if (anime.year) return anime.year.toString();
    return null;
  };

  const airedYear = getAiredInfo();
  const episodeCount = anime.episodes;

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all group text-left w-full",
            "liquid-glass-subtle hover:bg-foreground/5",
            "sun-glow moon-glow"
          )}
        >
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-foreground/80 transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {anime.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {anime.score && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-foreground fill-foreground" />
                  <span className="text-xs sm:text-sm font-medium">{formatScore(anime.score)}</span>
                </div>
              )}
              {airedYear && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">{airedYear}</span>
                </div>
              )}
              {episodeCount && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Play className="w-3 h-3" />
                  <span className="text-xs">{episodeCount} ep</span>
                </div>
              )}
            </div>
          </div>
        </button>
        
        <AnimeDetailModal
          animeId={anime.mal_id}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "block group animate-fade-up text-left w-full"
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Image with theme-specific hover effects */}
        <div className={cn(
          "relative aspect-[2/3] rounded-2xl overflow-hidden mb-2",
          "divine-card sun-glow moon-glow sun-rays-hover moon-reflection"
        )}>
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Episode count badge */}
          {episodeCount && (
            <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              E{episodeCount}
            </div>
          )}
        </div>

        {/* Title underneath */}
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
          {anime.title}
        </h3>

        {/* Metadata underneath - always visible */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {anime.status && (
            <span>{anime.status === "Currently Airing" ? "TV" : anime.status}</span>
          )}
          {airedYear && (
            <>
              <span>•</span>
              <span>{airedYear}</span>
            </>
          )}
        </div>
      </button>
      
      <AnimeDetailModal
        animeId={anime.mal_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
