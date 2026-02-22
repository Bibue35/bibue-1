import { useState, memo, forwardRef, lazy, Suspense, useCallback } from "react";
import { Star } from "lucide-react";
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
  // Default: cover image + title only. Hover: lift, shadow, image zoom, rating pill.
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className="block group text-left w-full relative rounded-xl sm:rounded-2xl transition-transform duration-200 ease-out active:scale-[0.98]"
      >
        {/* Image — 2:3 portrait, overflow-hidden clips the scale */}
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
            className="w-full h-full object-cover transition-transform duration-300 ease-out md:group-hover:scale-105 will-change-transform transform-gpu"
          />

          {/* Score badge - visible on hover */}
          {anime.score && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/90">
                <Star className="w-2.5 h-2.5 fill-white/90 text-white/90" />
                {formatScore(anime.score)}
              </span>
            </div>
          )}
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
