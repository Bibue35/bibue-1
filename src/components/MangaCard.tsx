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

  const getPublishedInfo = () => {
    if (manga.published?.from) {
      return new Date(manga.published.from).getFullYear().toString();
    }
    return null;
  };

  const publishedYear = getPublishedInfo();
  const chapterCount = manga.chapters;
  const statusLabel = manga.status === "Finished" ? "Completed" : manga.status === "Publishing" ? "Ongoing" : manga.status || null;

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-150 group text-left w-full hover:bg-accent/50 active:scale-[0.98]"
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
            <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
              {manga.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {typeLabel} {manga.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {manga.score && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{formatScore(manga.score)}</span>
                </div>
              )}
              {publishedYear && (
                <span className="text-xs text-muted-foreground">{publishedYear}</span>
              )}
              {chapterCount && (
                <span className="text-xs text-muted-foreground">{chapterCount} ch</span>
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
        <div className="bg-card rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-400 ease-in-out group-hover/card:-translate-y-3 group-hover/card:shadow-[0_12px_40px_rgba(192,192,192,0.08)] will-change-transform transform-gpu border border-transparent group-hover/card:border-[rgba(192,192,192,0.15)]">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={manga.images.webp.image_url}
              alt={`${manga.title} cover art`}
              width={300}
              height={400}
              loading="lazy"
              decoding="async"
              fetchPriority="auto"
              sizes="(max-width: 480px) 30vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 200px"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 will-change-transform transform-gpu"
            />

            {/* Top-right badges */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5">
              {manga.score && (
                <div className="bg-background/70 backdrop-blur-sm text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-primary text-primary" />
                  {formatScore(manga.score)}
                </div>
              )}
              {typeLabel && typeLabel !== "Manga" && (
                <div className={cn(
                  "text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium text-center",
                  getContentTypeBadgeClass(contentType)
                )}>
                  {typeLabel}
                </div>
              )}
            </div>

            {/* Save button - top left on hover */}
            <div
              className="absolute top-2 left-2 sm:top-3 sm:left-3 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
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
                className="bg-background/70 backdrop-blur-sm hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 md:p-5">
            <h3 className="font-semibold text-[11px] sm:text-sm md:text-base leading-tight line-clamp-1 sm:line-clamp-2 text-card-foreground group-hover/card:text-primary transition-colors">
              {manga.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {manga.authors && manga.authors.length > 0 && <>{manga.authors[0].name} • </>}
              {typeLabel}
              {publishedYear && <> • {publishedYear}</>}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3 text-[9px] sm:text-xs text-muted-foreground">
              {chapterCount && <span>Chapter {chapterCount}</span>}
              {chapterCount && statusLabel && <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />}
              {statusLabel && <span>{statusLabel}</span>}
            </div>
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
}));
