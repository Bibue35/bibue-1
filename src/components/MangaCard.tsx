import { useState, memo, forwardRef, lazy, Suspense } from "react";
import { Star, BookOpen, Calendar } from "lucide-react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
const MangaDetailModal = lazy(() => import("./MangaDetailModal").then(m => ({ default: m.MangaDetailModal })));
import { WatchlistButton } from "./WatchlistButton";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact";
}

export const MangaCard = memo(forwardRef<HTMLDivElement, MangaCardProps>(function MangaCard({ manga, index = 0, variant = "default" }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const contentType = getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin });
  const typeLabel = getContentLabel(contentType);

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
              <span className={cn("font-medium mr-1", getContentTypeBadgeClass(contentType), "bg-transparent px-0 py-0")}>{typeLabel}</span>
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
        className="block group/card text-left w-full active:scale-[0.98] transition-transform duration-150 isolate"
      >
        {/* Image with hover lift + shadow */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted will-change-transform transform-gpu transition-shadow duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10">
          <img
            src={manga.images.webp.image_url}
            alt={`${manga.title} cover art`}
            width={300}
            height={450}
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            sizes="(max-width: 480px) 30vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 176px"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-105 will-change-transform transform-gpu"
          />
          {/* Chapter count badge */}
          {chapterCount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md">
              {chapterCount} ch
            </div>
          )}
          {/* Start Reading overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-foreground">Start Reading →</span>
          </div>
          {/* Save button - appears on hover */}
          <div 
            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 opacity-0 group-hover/card:opacity-100 transition-all"
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
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
            />
          </div>
        </div>

        {/* Title — single line on mobile, 2 lines on desktop */}
        <h3 className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-1 sm:line-clamp-2 mb-0.5 sm:mb-1 group-hover/card:text-foreground/80 transition-colors leading-tight">
          {manga.title}
        </h3>

        {/* Score + Author row */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          {manga.score && (
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
              {formatScore(manga.score)}
            </span>
          )}
          {manga.authors && manga.authors.length > 0 && (
            <>
              {manga.score && <span>·</span>}
              <span className="truncate">{manga.authors[0].name}</span>
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
