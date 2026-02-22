import { useState, memo, useCallback, lazy, Suspense } from "react";
import { Star, Plus, Check } from "lucide-react";
import { Anime, formatScore, getAnimeById } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isBookmarked = isInWatchlist(anime.anilist_id, "anime");

  const prefetchDetail = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["anime", anime.anilist_id, language],
      queryFn: () => getAnimeById(anime.anilist_id, language as any),
      staleTime: 1000 * 60 * 60,
    });
  }, [queryClient, anime.anilist_id, language]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
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
  }, [user, isBookmarked, anime, addToWatchlist, removeFromWatchlist]);

  // Featured variant — large banner card
  if (variant === "featured") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          onMouseEnter={prefetchDetail}
          onTouchStart={prefetchDetail}
          className="relative w-full overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform duration-150"
        >
          <div className="relative aspect-[3/4] sm:aspect-[16/9] overflow-hidden">
            <img
              src={anime.images.webp.large_image_url || anime.images.webp.image_url}
              alt={`${anime.title} cover art`}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl line-clamp-2 mb-1">
              {anime.title}
            </h3>
            {anime.score && (
              <span className="flex items-center gap-1 text-sm font-medium">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                {formatScore(anime.score)}
              </span>
            )}
          </div>
        </button>
        <AnimeDetailModal animeId={anime.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  // Compact variant — horizontal list item
  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          onMouseEnter={prefetchDetail}
          onTouchStart={prefetchDetail}
          className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-all duration-150 group text-left w-full active:scale-[0.98]"
        >
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
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {anime.genres?.slice(0, 2).map(g => g.name).join(" • ")}
            </p>
          </div>
        </button>
        {modalOpen && (
          <Suspense fallback={null}>
            <AnimeDetailModal animeId={anime.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
          </Suspense>
        )}
      </>
    );
  }

  // === IMMERSIVE DEFAULT — Image dominant, minimal text ===
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className="block group text-left w-full active:scale-[0.97] transition-transform duration-150"
      >
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-1.5 bg-card shadow-lg shadow-black/10 will-change-transform transform-gpu">
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

          {/* Save button — always visible on mobile */}
          {user && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              aria-label={isBookmarked ? `Remove ${anime.title} from watchlist` : `Add ${anime.title} to watchlist`}
              className={cn(
                "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
                isBookmarked 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/90 backdrop-blur-sm"
              )}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )}

          {/* Progress bar */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          )}
        </div>

        {/* Title only — clean, no clutter */}
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {anime.title}
        </h3>
      </button>

      {modalOpen && (
        <Suspense fallback={null}>
          <AnimeDetailModal animeId={anime.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
        </Suspense>
      )}
    </>
  );
});
