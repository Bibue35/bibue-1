import { useState, memo, forwardRef, lazy, Suspense } from "react";
import { Star, Calendar, Play } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { WatchlistButton } from "./WatchlistButton";
import { TitleTooltip } from "./TitleTooltip";
import { EpisodeCountdown } from "./EpisodeCountdown";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default" }, ref) {
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

  // Format upcoming release date (e.g., "Jan 15" or "Apr 2026")
  const getUpcomingDate = () => {
    if (anime.status === "NOT_YET_RELEASED" && anime.aired?.from) {
      const date = new Date(anime.aired.from);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // If it's this year, show "Jan 15", otherwise show "Apr 2026"
      if (year === currentYear) {
        return `${month} ${day}`;
      }
      return `${month} ${year}`;
    }
    return null;
  };

  const airedYear = getAiredInfo();
  const upcomingDate = getUpcomingDate();
  const episodeCount = anime.episodes;

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-150 group text-left w-full hover:bg-foreground/5 active:scale-[0.98]"
        >
          <img
            src={anime.images.webp.image_url}
            alt={`${anime.title} cover art`}
            width={64}
            height={80}
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
        
        {modalOpen && (
          <Suspense fallback={null}>
            <AnimeDetailModal
              animeId={anime.anilist_id}
              open={modalOpen}
              onOpenChange={setModalOpen}
            />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="block group text-left w-full active:scale-[0.98] transition-transform duration-150"
      >
        {/* Image with simple hover effect */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted will-change-transform transform-gpu">
          <img
            src={anime.images.webp.image_url}
            alt={`${anime.title} cover art`}
            width={176}
            height={264}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform transform-gpu"
          />
          {/* Episode count badge */}
          {episodeCount && !anime.nextAiringEpisode && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-background/80 text-foreground text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-1.5 rounded">
              E{episodeCount}
            </div>
          )}
          {/* Airing countdown badge */}
          {anime.nextAiringEpisode && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
              <EpisodeCountdown
                airingAt={anime.nextAiringEpisode.airingAt}
                episode={anime.nextAiringEpisode.episode}
                compact
              />
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

        {/* Title with verification tooltip */}
        <div className="flex items-start gap-1">
          <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 mb-0.5 sm:mb-1 group-hover:text-foreground/80 transition-colors leading-tight flex-1">
            {anime.title}
          </h3>
          <TitleTooltip 
            romaji={anime.title_romaji}
            english={anime.title_english}
            native={anime.title_japanese}
            className="mt-0.5 shrink-0"
          />
        </div>

        {/* Score */}
        {anime.score && (
          <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">{formatScore(anime.score)}</span>
          </div>
        )}

        {/* Metadata underneath - always visible */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-xs text-muted-foreground">
          {anime.status === "NOT_YET_RELEASED" && upcomingDate ? (
            <span className="text-primary font-medium">{upcomingDate}</span>
          ) : anime.status && (
            <span>{anime.status === "Currently Airing" ? "TV" : anime.status === "RELEASING" ? "Airing" : anime.status === "FINISHED" ? "Finished" : anime.status}</span>
          )}
          {airedYear && anime.status !== "NOT_YET_RELEASED" && (
            <>
              <span>•</span>
              <span>{airedYear}</span>
            </>
          )}
        </div>
      </button>
      
      {modalOpen && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={anime.anilist_id}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </>
  );
}));
