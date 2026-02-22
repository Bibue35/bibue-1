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
  eager?: boolean;
  /** Position in row for transform-origin: 'first' | 'last' | 'middle' */
  position?: "first" | "last" | "middle";
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default", eager = false, position = "middle" }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const typeLabel = anime.episodes === 1 ? "Movie" : anime.episodes ? `${anime.episodes} eps` : "";
  const genreText = anime.genres?.slice(0, 3).map(g => g.name).join(" • ") || "";

  const transformOrigin =
    position === "first" ? "left center" :
    position === "last" ? "right center" :
    "center center";

  return (
    <>
      {/* Wrapper — relative positioning context for the hover expansion */}
      <div
        className="relative flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 50 : "auto" }}
      >
        {/* Base card — poster + title, always visible */}
        <div
          onClick={() => setModalOpen(true)}
          className="cursor-pointer"
        >
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
            <img
              src={anime.images.webp.image_url}
              alt={`${anime.title} cover art`}
              width={190}
              height={285}
              loading={eager ? "eager" : "lazy"}
              decoding={eager ? "sync" : "async"}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium truncate mt-1.5 px-0.5">{anime.title}</p>
        </div>

        {/* Hover expansion — desktop only via @media(hover:hover) + hidden md:block */}
        <div
          className={cn(
            "absolute top-0 left-0 w-full hidden md:block pointer-events-none rounded-lg",
            isHovered ? "pointer-events-auto" : ""
          )}
          style={{
            transformOrigin,
            transform: isHovered ? "scale(1.3)" : "scale(1)",
            opacity: isHovered ? 1 : 0,
            transition: isHovered
              ? "transform 300ms ease, opacity 150ms ease"
              : "transform 200ms ease-in, opacity 150ms ease-in",
            boxShadow: isHovered ? "0 25px 50px -12px rgba(0,0,0,0.9)" : "none",
          }}
        >
          {/* Poster image */}
          <div
            className="aspect-[2/3] rounded-t-lg overflow-hidden cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <img
              src={anime.images.webp.large_image_url || anime.images.webp.image_url}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info panel below image */}
          <div
            className="rounded-b-lg px-3 py-2.5"
            style={{
              backgroundColor: "#181818",
              maxHeight: isHovered ? "100px" : "0px",
              overflow: "hidden",
              opacity: isHovered ? 1 : 0,
              transition: "max-height 300ms ease, opacity 200ms ease 100ms",
            }}
          >
            {/* Action buttons */}
            <div className="flex items-center gap-1.5 mb-2">
              <button
                onClick={() => setModalOpen(true)}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors"
                aria-label="Play"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              {user && (
                <button
                  onClick={handleSave}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
                    inWatchlist
                      ? "border-white bg-white/20 text-white"
                      : "border-gray-400 text-gray-400 hover:border-white hover:text-white"
                  )}
                  aria-label={inWatchlist ? "Remove from list" : "Add to list"}
                >
                  {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                className="w-7 h-7 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-white hover:text-white transition-colors"
                aria-label="Like"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setModalOpen(true)}
                className="w-7 h-7 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-white hover:text-white transition-colors"
                aria-label="More info"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mb-1">
              {anime.score && (
                <span className="text-xs font-semibold text-emerald-400">
                  {formatScore(anime.score)}
                </span>
              )}
              {typeLabel && <span className="text-xs text-white">{typeLabel}</span>}
              {anime.status && <span className="text-xs text-white">{anime.status === "RELEASING" ? "Airing" : ""}</span>}
            </div>

            {/* Genres */}
            {genreText && (
              <p className="text-[10px] text-gray-400 truncate">{genreText}</p>
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
