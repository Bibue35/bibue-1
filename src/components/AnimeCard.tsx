import { useState, memo, forwardRef, lazy, Suspense } from "react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { WatchlistButton } from "./WatchlistButton";
import { EpisodeCountdown } from "./EpisodeCountdown";
import { usePrefetch } from "@/hooks/usePrefetch";
import { formatViewCount } from "@/hooks/useMediaViews";
import { Eye } from "lucide-react";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
  eager?: boolean;
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default", eager = false }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const { onHoverStart, onHoverEnd } = usePrefetch();
  const { formatted: viewCount } = useMediaViewCount(anime.anilist_id, "anime");
  const recordView = useRecordView();

  const handleOpen = () => {
    setModalOpen(true);
    recordView(anime.anilist_id, "anime");
  };

  const getAiredInfo = () => {
    if (anime.aired?.from) return new Date(anime.aired.from).getFullYear().toString();
    if (anime.year) return anime.year.toString();
    return null;
  };

  const getUpcomingDate = () => {
    if (anime.status === "NOT_YET_RELEASED" && anime.aired?.from) {
      const date = new Date(anime.aired.from);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      return year === currentYear ? `${month} ${day}` : `${month} ${year}`;
    }
    return null;
  };

  const airedYear = getAiredInfo();
  const upcomingDate = getUpcomingDate();
  const episodeCount = anime.episodes;
  const statusLabel = anime.status === "Currently Airing" || anime.status === "RELEASING" ? "Airing" : anime.status === "FINISHED" ? "Finished" : anime.status || null;

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={handleOpen}
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-150 group text-left w-full hover:bg-accent/50 active:scale-[0.98]"
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
            <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {anime.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {anime.score && (
                <span className="text-xs sm:text-sm font-medium">{formatScore(anime.score)}</span>
              )}
              {airedYear && <span className="text-xs text-muted-foreground">{airedYear}</span>}
              {episodeCount && <span className="text-xs text-muted-foreground">{episodeCount} ep</span>}
              <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Eye className="w-3 h-3" />{viewCount}</span>
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
        onClick={handleOpen}
        onMouseEnter={() => onHoverStart("anime", anime.anilist_id)}
        onMouseLeave={onHoverEnd}
        className="block group/card text-left w-full transition-transform duration-200 isolate spring-hover ring-pulse"
      >
        <div className="bg-card rounded-2xl sm:rounded-3xl overflow-hidden relative transition-all duration-400 divine-glow-hover glow-line-top will-change-transform transform-gpu">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={anime.images.webp.image_url}
              alt={`${anime.title} cover art`}
              width={300}
              height={400}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 200px"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03] will-change-transform transform-gpu"
            />

            {/* Score badge */}
            {anime.score && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 glass-panel text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                {formatScore(anime.score)}
              </div>
            )}

            {/* Episode count */}
            {episodeCount && !anime.nextAiringEpisode && (
              <div className="absolute top-8 right-2 sm:top-10 sm:right-3 glass-panel text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium text-center">
                {episodeCount} EP
              </div>
            )}

            {/* Airing countdown */}
            {anime.nextAiringEpisode && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <EpisodeCountdown
                  airingAt={anime.nextAiringEpisode.airingAt}
                  episode={anime.nextAiringEpisode.episode}
                  compact
                />
              </div>
            )}

            {/* Save button */}
            {!anime.nextAiringEpisode && (
              <div
                className="absolute top-2 left-2 sm:top-3 sm:left-3 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
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
                  className="glass-panel hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 md:p-5">
            <h3 className="font-medium text-[11px] sm:text-sm md:text-base leading-tight line-clamp-1 sm:line-clamp-2 text-card-foreground group-hover/card:text-primary transition-colors duration-300">
              {anime.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {anime.status === "NOT_YET_RELEASED" && upcomingDate ? (
                <span className="text-primary font-medium">{upcomingDate}</span>
              ) : (
                <>
                  {statusLabel && <>{statusLabel}</>}
                  {airedYear && <> · {airedYear}</>}
                </>
              )}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3 text-[9px] sm:text-xs text-muted-foreground">
              {episodeCount && <span>{episodeCount} Episodes</span>}
              {anime.genres && anime.genres.length > 0 && (
                <>
                  {episodeCount && <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />}
                  <span className="truncate">{anime.genres.slice(0, 2).map(g => g.name).join(", ")}</span>
                </>
              )}
              <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{viewCount}</span>
            </div>
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
}));
