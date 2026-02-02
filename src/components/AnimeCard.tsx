import { useState, memo, useCallback } from "react";
import { Star, Calendar, Play, Bookmark } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimeDetailModal } from "./AnimeDetailModal";
import { WatchlistButton } from "./WatchlistButton";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
}

export const AnimeCard = memo(function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
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
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors group text-left w-full hover:bg-foreground/5"
        >
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            loading="lazy"
            decoding="async"
            className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg bg-muted"
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
          animeId={anime.anilist_id}
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
        className="block group text-left w-full"
      >
        {/* Image with simple hover effect */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted">
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {/* Episode count badge */}
          {episodeCount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-background/80 text-foreground text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-1.5 rounded">
              E{episodeCount}
            </div>
          )}
          {/* Save button - appears on hover */}
          <div 
            className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <WatchlistButton
              mal_id={anime.anilist_id}
              media_type="anime"
              title={anime.title}
              title_japanese={anime.title_japanese}
              image_url={anime.images.webp.image_url}
              score={anime.score}
              variant="icon"
              className="bg-background/80 hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
            />
          </div>
        </div>

        {/* Title underneath */}
        <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 mb-0.5 sm:mb-1 group-hover:text-foreground/80 transition-colors leading-tight">
          {anime.title}
        </h3>

        {/* Score */}
        {anime.score && (
          <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">{formatScore(anime.score)}</span>
          </div>
        )}

        {/* Metadata underneath - always visible */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-xs text-muted-foreground">
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
        animeId={anime.anilist_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
});
