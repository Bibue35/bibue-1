import { useState, memo, useCallback, lazy, Suspense } from "react";
import { Star, Play, Plus, Check } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MobileAnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "featured" | "compact";
  showProgress?: boolean;
  progress?: number;
  eager?: boolean;
}

export const MobileAnimeCard = memo(function MobileAnimeCard({ 
  anime, 
  index = 0, 
  variant = "default",
  showProgress = false,
  progress = 0,
  eager = false,
}: MobileAnimeCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading } = useWatchlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const isBookmarked = isInWatchlist(anime.anilist_id, "anime");

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to save", variant: "destructive" });
      return;
    }
    if (isBookmarked) {
      removeFromWatchlist.mutate({ mal_id: anime.anilist_id, media_type: "anime" });
    } else {
      addToWatchlist.mutate({
        mal_id: anime.anilist_id,
        media_type: "anime",
        title: anime.title,
        title_japanese: anime.title_japanese,
        image_url: anime.images.webp.image_url,
        score: anime.score,
      });
    }
  }, [user, isBookmarked, anime, addToWatchlist, removeFromWatchlist, toast]);

  const getAiredInfo = () => {
    if (anime.aired?.from) {
      return new Date(anime.aired.from).getFullYear().toString();
    }
    return anime.year?.toString() || null;
  };

  const airedYear = getAiredInfo();
  const episodeCount = anime.episodes;

  // Featured variant - large card with full details
  if (variant === "featured") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="relative w-full overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform duration-150"
        >
          {/* Background Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <img
              src={anime.images.webp.large_image_url || anime.images.webp.image_url}
              alt={`${anime.title} cover art`}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-end gap-3">
              {/* Mini Poster */}
              <div className="hidden sm:block w-20 md:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-xl flex-shrink-0 border-2 border-background/50">
                <img
                  src={anime.images.webp.image_url}
                  alt=""
                  width={96}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Genre badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {anime.genres?.slice(0, 2).map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] sm:text-xs font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <h3 className="font-bold text-lg sm:text-xl md:text-2xl line-clamp-2 mb-1 text-foreground">
                  {anime.title}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                  {anime.score && (
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary text-primary" />
                      {formatScore(anime.score)}
                    </span>
                  )}
                  {airedYear && <span>{airedYear}</span>}
                  {episodeCount && <span>{episodeCount} eps</span>}
                </div>
              </div>

              {/* Play Button */}
              <button
                className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                aria-label={`Watch ${anime.title}`}
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              </button>
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

  // Compact variant - horizontal list item
  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-all duration-150 group text-left w-full active:scale-[0.98]"
        >
          {/* Poster */}
          <div className="relative w-14 sm:w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={anime.images.webp.image_url}
              alt={`${anime.title} cover art`}
              width={64}
              height={96}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Progress bar if showing */}
            {showProgress && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {anime.genres?.slice(0, 2).map(g => g.name).join(" • ")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {anime.score && (
                <span className="flex items-center gap-0.5 text-xs font-medium">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {formatScore(anime.score)}
                </span>
              )}
              {episodeCount && (
                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  {episodeCount} eps
                </span>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            aria-label={isBookmarked ? `Remove ${anime.title} from watchlist` : `Add ${anime.title} to watchlist`}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              isBookmarked ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            {isBookmarked ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
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

  // Default variant - card with soft UI styling
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="block group text-left w-full active:scale-[0.97] transition-transform duration-150"
      >
        {/* Card with soft shadow */}
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 bg-card shadow-lg shadow-black/10 will-change-transform transform-gpu">
          <img
            src={anime.images.webp.image_url}
            srcSet={`${anime.images.webp.image_url} 230w, ${anime.images.webp.medium_image_url || anime.images.webp.large_image_url} 460w, ${anime.images.webp.large_image_url} 600w`}
            alt={`${anime.title} cover art`}
            width={176}
            height={264}
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            sizes="(max-width: 640px) 128px, 176px"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform transform-gpu"
          />
          
          {/* Score badge - top left with neumorphic style */}
          {anime.score && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs font-bold">{formatScore(anime.score)}</span>
            </div>
          )}

          {/* Episode count badge */}
          {episodeCount && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm text-[10px] font-bold">
              {episodeCount} EP
            </div>
          )}

          {/* Save button - bottom right, always visible on mobile */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            aria-label={isBookmarked ? `Remove ${anime.title} from watchlist` : `Add ${anime.title} to watchlist`}
            className={cn(
              "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
              isBookmarked 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/90 backdrop-blur-sm hover:bg-background"
            )}
          >
            {isBookmarked ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>

          {/* Progress bar if showing */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>

      {/* Title */}
      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
        {anime.title}
      </h3>

      {/* Meta info */}
      <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-xs text-muted-foreground">
        {anime.status && <span>{anime.status === "Currently Airing" ? "TV" : anime.status}</span>}
        {airedYear && (
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
});
