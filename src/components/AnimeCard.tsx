import { useState, memo, forwardRef, lazy, Suspense, useCallback } from "react";
import { Star, Plus, Check } from "lucide-react";
import { Anime, formatScore, getAnimeById } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
  /** Load image eagerly (for above-fold first row) */
  eager?: boolean;
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default", eager = false }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(anime.anilist_id, "anime");

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
    if (inWatchlist) {
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
  }, [user, inWatchlist, anime, addToWatchlist, removeFromWatchlist]);

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          onMouseEnter={prefetchDetail}
          onTouchStart={prefetchDetail}
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

  // === NETFLIX-STYLE DEFAULT CARD ===
  // Default: cover image + title only. Hover: lift, gradient, minimal overlay info.
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className={cn(
          "block group text-left w-full active:scale-[0.98]",
          "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          "md:hover:-translate-y-2 md:hover:z-10 md:hover:shadow-xl md:hover:shadow-black/50 relative rounded-xl sm:rounded-2xl"
        )}
      >
        {/* Image — 2:3 portrait, overflow-hidden for scale */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted">
          <img
            src={anime.images.webp.image_url}
            srcSet={`${anime.images.webp.image_url} 230w, ${anime.images.webp.medium_image_url || anime.images.webp.large_image_url} 460w, ${anime.images.webp.large_image_url} 600w`}
            alt={`${anime.title} cover art`}
            width={176}
            height={264}
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
            className={cn(
              "w-full h-full object-cover will-change-transform transform-gpu",
              "transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              "md:group-hover:scale-[1.03]"
            )}
          />

          {/* HOVER GRADIENT + INFO — desktop only */}
          <div
            className={cn(
              "absolute inset-0 hidden md:flex flex-col justify-end",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              "pointer-events-none"
            )}
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
            }}
          >
            <div className="p-3 pointer-events-auto">
              {/* Title */}
              <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1.5">
                {anime.title}
              </h3>

              {/* Rating pill */}
              {anime.score && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 mb-1.5">
                  <Star className="w-3 h-3 fill-white text-white" />
                  {formatScore(anime.score)}
                </span>
              )}

              {/* One-line synopsis */}
              {anime.synopsis && (
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-2">
                  {anime.synopsis}
                </p>
              )}

              {/* Add to watchlist icon */}
              {user && (
                <button
                  onClick={handleSave}
                  className={cn(
                    "absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full",
                    "transition-colors duration-200",
                    inWatchlist
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-black/50 text-white hover:bg-black/70"
                  )}
                >
                  {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title — always visible below image */}
        <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 mb-0.5 transition-colors leading-tight">
          {anime.title}
        </h3>
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
