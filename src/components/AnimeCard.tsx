import { useState, memo, forwardRef, lazy, Suspense, useCallback, useRef } from "react";
import { Star, Plus, Check, Play } from "lucide-react";
import { Anime, formatScore, getAnimeById } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useImageColor } from "@/hooks/useImageColor";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
  eager?: boolean;
  /** Show progress bar (0-100) */
  progress?: number;
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default", eager = false, progress }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(anime.anilist_id, "anime");
  const dominantColor = useImageColor(anime.images.webp.image_url);

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

  // Dynamic shadow color from extracted color
  const glowStyle = dominantColor
    ? { "--card-glow": `${dominantColor.h} ${Math.min(dominantColor.s, 70)}% ${Math.min(dominantColor.l + 10, 60)}%` } as React.CSSProperties
    : undefined;

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

  // === IMMERSIVE DEFAULT CARD ===
  return (
    <>
      <button
        ref={ref as any}
        onClick={() => setModalOpen(true)}
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className="block group text-left w-full active:scale-[0.97] transition-all duration-200"
        style={glowStyle}
      >
        {/* Image — 2:3 portrait ratio, ~85% of card area */}
        <div
          className={cn(
            "relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted will-change-transform transform-gpu",
            "transition-all duration-300 ease-out",
            "group-hover:-translate-y-2 group-hover:shadow-[0_12px_40px_hsl(var(--card-glow,var(--primary))/0.25)]"
          )}
        >
          <img
            src={anime.images.webp.image_url}
            srcSet={`${anime.images.webp.image_url} 230w, ${anime.images.webp.medium_image_url || anime.images.webp.large_image_url} 460w, ${anime.images.webp.large_image_url} 600w`}
            alt={`${anime.title} cover art`}
            width={176}
            height={264}
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] will-change-transform transform-gpu"
          />

          {/* HOVER OVERLAY — synopsis, rating, genres, save button */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 sm:p-4">
            {anime.synopsis && (
              <p className="text-[10px] sm:text-xs text-foreground/80 line-clamp-3 mb-2 leading-relaxed">
                {anime.synopsis}
              </p>
            )}

            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {anime.score && (
                <span className="flex items-center gap-0.5 text-xs font-bold">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  {formatScore(anime.score)}
                </span>
              )}
              {anime.genres?.slice(0, 2).map((g) => (
                <span key={g.mal_id} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                  {g.name}
                </span>
              ))}
            </div>

            {user && (
              <button
                onClick={handleSave}
                className={cn(
                  "flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium transition-colors",
                  inWatchlist
                    ? "bg-primary/20 text-primary"
                    : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                )}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {inWatchlist ? "Saved" : "Add to List"}
              </button>
            )}
          </div>

          {/* Progress bar — reading/watching progress */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/40">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: dominantColor ? `hsl(${dominantColor.h} ${Math.min(dominantColor.s, 80)}% 55%)` : "hsl(var(--primary))",
                }}
              />
            </div>
          )}
        </div>

        {/* Title — small, clean, below image */}
        <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 mb-0.5 group-hover:text-foreground/80 transition-colors leading-tight">
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
