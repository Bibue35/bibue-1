import { useState, memo, forwardRef, lazy, Suspense } from "react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
const MangaDetailModal = lazy(() => import("./MangaDetailModal").then(m => ({ default: m.MangaDetailModal })));
import { WatchlistButton } from "./WatchlistButton";
import { useMediaViewCount, useRecordView } from "@/hooks/useMediaViews";
import { Eye } from "lucide-react";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact" | "masonry";
}

export const MangaCard = memo(forwardRef<HTMLDivElement, MangaCardProps>(function MangaCard({ manga, index = 0, variant = "default" }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const { formatted: viewCount } = useMediaViewCount(manga.anilist_id, "manga");
  const recordView = useRecordView();

  const handleOpen = () => {
    setModalOpen(true);
    recordView(manga.anilist_id, "manga");
  };
  const contentType = getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin });
  const typeLabel = getContentLabel(contentType);

  const publishedYear = manga.published?.from ? new Date(manga.published.from).getFullYear().toString() : null;
  const chapterCount = manga.chapters;
  const statusLabel = manga.status === "Finished" ? "Completed" : manga.status === "Publishing" ? "Ongoing" : manga.status || null;

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={handleOpen}
          className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-left w-full hover:bg-accent/50 active:scale-[0.98]"
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
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {manga.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {typeLabel} {manga.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {manga.score && (
                <span className="text-xs font-medium">{formatScore(manga.score)}</span>
              )}
              {publishedYear && <span className="text-xs text-muted-foreground">{publishedYear}</span>}
              {chapterCount && <span className="text-xs text-muted-foreground">{chapterCount} ch</span>}
              <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Eye className="w-3 h-3" />{viewCount}</span>
            </div>
          </div>
        </button>
        {modalOpen && (
          <Suspense fallback={null}>
            <MangaDetailModal mangaId={manga.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
          </Suspense>
        )}
      </>
    );
  }

  const isMasonry = variant === "masonry";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="block group/card text-left w-full transition-transform duration-200 isolate spring-hover ring-pulse"
      >
        <div className={cn(
          "bg-card rounded-2xl overflow-hidden relative",
          "transition-all duration-400 ease-out",
          "border border-border/0 hover:border-border/10",
          "divine-glow-hover glow-line-top",
          "will-change-transform transform-gpu"
        )}>
          {/* Image */}
          <div className={cn("relative overflow-hidden", isMasonry ? "" : "aspect-[3/4]")}>
            <img
              src={manga.images.webp.image_url}
              alt={`${manga.title} cover art`}
              width={300}
              height={isMasonry ? undefined : 400}
              loading="lazy"
              decoding="async"
              fetchPriority="auto"
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 200px"
              className={cn(
                "w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03] will-change-transform transform-gpu",
                isMasonry ? "h-auto" : "h-full"
              )}
            />

            {/* Score badge */}
            {manga.score && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 glass-panel text-foreground text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium">
                {formatScore(manga.score)}
              </div>
            )}

            {/* Type badge */}
            {typeLabel && typeLabel !== "Manga" && (
              <div className={cn(
                "absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium",
                getContentTypeBadgeClass(contentType)
              )}>
                {typeLabel}
              </div>
            )}

            {/* Save — hover only */}
            <div
              className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
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
                className="glass-panel hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            <h3 className="font-medium text-[11px] sm:text-sm leading-tight line-clamp-2 text-card-foreground group-hover/card:text-primary transition-colors duration-300">
              {manga.title}
            </h3>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-1.5">
              {manga.authors && manga.authors.length > 0 && <>{manga.authors[0].name} · </>}
              {typeLabel}
              {publishedYear && <> · {publishedYear}</>}
            </p>

            <div className="flex items-center gap-2 mt-1.5 text-[9px] sm:text-[11px] text-muted-foreground/70">
              {chapterCount && <span>{chapterCount} ch</span>}
              {chapterCount && statusLabel && <span>·</span>}
              {statusLabel && <span>{statusLabel}</span>}
            </div>
          </div>
        </div>
      </button>

      {modalOpen && (
        <Suspense fallback={null}>
          <MangaDetailModal mangaId={manga.anilist_id} open={modalOpen} onOpenChange={setModalOpen} />
        </Suspense>
      )}
    </>
  );
}));
