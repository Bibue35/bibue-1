import { useState, memo, forwardRef, lazy, Suspense, useCallback } from "react";
import { Star, BookOpen, Calendar } from "lucide-react";
import { Manga, formatScore, getMangaById } from "@/lib/api";
import { cn } from "@/lib/utils";
const MangaDetailModal = lazy(() => import("./MangaDetailModal").then(m => ({ default: m.MangaDetailModal })));
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { WatchlistButton } from "./WatchlistButton";
import { TitleTooltip } from "./TitleTooltip";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact";
}

export const MangaCard = memo(forwardRef<HTMLDivElement, MangaCardProps>(function MangaCard({ manga, index = 0, variant = "default" }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Prefetch detail data on hover/touch
  const prefetchDetail = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["manga", manga.anilist_id, language],
      queryFn: () => getMangaById(manga.anilist_id, language as any),
      staleTime: 1000 * 60 * 60,
    });
  }, [queryClient, manga.anilist_id, language]);

  // Format published date
  const getPublishedInfo = () => {
    if (manga.published?.from) {
      const date = new Date(manga.published.from);
      return date.getFullYear().toString();
    }
    return null;
  };

  const publishedYear = getPublishedInfo();
  const chapterCount = manga.chapters;
  const volumeCount = manga.volumes;

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
            src={manga.images.webp.image_url}
            alt={`${manga.title} cover art`}
            width={64}
            height={80}
            loading="lazy"
            decoding="async"
            className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg bg-muted"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-foreground/80 transition-colors">
              {manga.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {manga.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {manga.score && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-foreground fill-foreground" />
                  <span className="text-xs sm:text-sm font-medium">{formatScore(manga.score)}</span>
                </div>
              )}
              {publishedYear && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">{publishedYear}</span>
                </div>
              )}
              {chapterCount && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs">{chapterCount} ch</span>
                </div>
              )}
            </div>
          </div>
        </button>
        
        {modalOpen && (
          <Suspense fallback={null}>
            <MangaDetailModal
              mangaId={manga.anilist_id}
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
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className="block group text-left w-full active:scale-[0.98] transition-transform duration-150"
      >
        {/* Image with simple hover effect */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted will-change-transform transform-gpu">
          <img
            src={manga.images.webp.image_url}
            srcSet={`${manga.images.webp.image_url} 230w, ${manga.images.webp.medium_image_url || manga.images.webp.large_image_url} 460w, ${manga.images.webp.large_image_url} 600w`}
            alt={`${manga.title} cover art`}
            width={176}
            height={264}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform transform-gpu"
          />
          {/* Chapter count badge */}
          {chapterCount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-background/80 text-foreground text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-1.5 rounded">
              C{chapterCount}
            </div>
          )}
          {/* Save button - appears on hover */}
          <div 
            className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <WatchlistButton
              mal_id={manga.anilist_id}
              media_type="manga"
              title={manga.title}
              title_japanese={manga.title_japanese}
              image_url={manga.images.webp.image_url}
              score={manga.score}
              variant="icon"
              className="bg-background/80 hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
            />
          </div>
        </div>

        {/* Title with verification tooltip */}
        <div className="flex items-start gap-1">
          <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 mb-0.5 sm:mb-1 group-hover:text-foreground/80 transition-colors leading-tight flex-1">
            {manga.title}
          </h3>
          <TitleTooltip 
            romaji={manga.title_romaji}
            english={manga.title_english}
            native={manga.title_japanese}
            className="mt-0.5 shrink-0"
          />
        </div>

        {/* Score */}
        {manga.score && (
          <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">{formatScore(manga.score)}</span>
          </div>
        )}

        {/* Metadata underneath - always visible */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-xs text-muted-foreground">
          {manga.type && <span>{manga.type}</span>}
          {publishedYear && (
            <>
              <span>•</span>
              <span>{publishedYear}</span>
            </>
          )}
        </div>
      </button>
      
      {modalOpen && (
        <Suspense fallback={null}>
          <MangaDetailModal
            mangaId={manga.anilist_id}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </>
  );
}));
