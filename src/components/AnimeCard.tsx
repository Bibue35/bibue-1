import { useState, useRef, useEffect, memo, forwardRef, lazy, Suspense, useCallback } from "react";
import { Star, Plus, Check, ThumbsUp, ChevronDown, Play } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleMouseEnter = useCallback(() => {
    prefetchDetail();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  }, [prefetchDetail]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

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

  // Episode/type label
  const typeLabel = anime.episodes === 1 ? "Movie" : anime.episodes ? `${anime.episodes} eps` : "";
  const genreText = anime.genres?.slice(0, 3).map(g => g.name).join(" • ") || "";

  return (
    <>
      <div
        ref={cardRef}
        className="relative flex-shrink-0 w-[112px] sm:w-[144px] md:w-[176px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 50 : "auto" }}
      >
        {/* Base card — always visible, just the poster */}
        <div
          onClick={() => setModalOpen(true)}
          className="cursor-pointer"
        >
          <div className="aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-muted">
            <img
              src={anime.images.webp.image_url}
              srcSet={`${anime.images.webp.image_url} 230w, ${anime.images.webp.medium_image_url || anime.images.webp.large_image_url} 460w, ${anime.images.webp.large_image_url} 600w`}
              alt={`${anime.title} cover art`}
              width={176}
              height={264}
              loading={eager ? "eager" : "lazy"}
              decoding={eager ? "sync" : "async"}
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Expanded hover card — desktop only, uses @media(hover:hover) via hidden class + isHovered */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 hidden md:block pointer-events-none",
            "transition-all duration-300 ease-out",
            isHovered
              ? "opacity-100 scale-[1.4] pointer-events-auto"
              : "opacity-0 scale-100"
          )}
          style={{
            width: "100%",
            transformOrigin: "center center",
            transform: isHovered
              ? "translate(-50%, -50%) scale(1.4)"
              : "translate(-50%, -50%) scale(1)",
            transition: isHovered
              ? "transform 300ms ease-out, opacity 300ms ease-out"
              : "transform 200ms ease-in, opacity 200ms ease-in",
          }}
        >
          {/* Image section */}
          <div
            className="rounded-t-lg overflow-hidden cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <div className="aspect-[2/3] overflow-hidden">
              <img
                src={anime.images.webp.large_image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info panel below image */}
          <div
            className={cn(
              "bg-[hsl(var(--card))] rounded-b-lg px-3 py-2.5 shadow-2xl shadow-black/80",
              "transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Action buttons row */}
            <div className="flex items-center gap-1.5 mb-2">
              {/* Play */}
              <button
                onClick={() => setModalOpen(true)}
                className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
                aria-label="Play"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              {/* Add to list */}
              {user && (
                <button
                  onClick={handleSave}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
                    inWatchlist
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-muted-foreground/50 text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                  aria-label={inWatchlist ? "Remove from list" : "Add to list"}
                >
                  {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
              {/* Like */}
              <button
                className="w-7 h-7 rounded-full border-2 border-muted-foreground/50 text-muted-foreground flex items-center justify-center hover:border-foreground hover:text-foreground transition-colors"
                aria-label="Like"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              {/* Spacer */}
              <div className="flex-1" />
              {/* More info */}
              <button
                onClick={() => setModalOpen(true)}
                className="w-7 h-7 rounded-full border-2 border-muted-foreground/50 text-muted-foreground flex items-center justify-center hover:border-foreground hover:text-foreground transition-colors"
                aria-label="More info"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rating + type */}
            <div className="flex items-center gap-2 mb-1">
              {anime.score && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {formatScore(anime.score)}
                </span>
              )}
              {typeLabel && (
                <span className="text-xs text-foreground">{typeLabel}</span>
              )}
            </div>

            {/* Genres */}
            {genreText && (
              <p className="text-[10px] text-muted-foreground truncate">{genreText}</p>
            )}
          </div>
        </div>
      </div>
      
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
