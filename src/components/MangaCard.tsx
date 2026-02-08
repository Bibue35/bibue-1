import { useState, memo, forwardRef } from "react";
import { Star, BookOpen, Calendar } from "lucide-react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MangaDetailModal } from "./MangaDetailModal";
import { WatchlistButton } from "./WatchlistButton";
import { TitleTooltip } from "./TitleTooltip";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact";
}

export const MangaCard = memo(forwardRef<HTMLDivElement, MangaCardProps>(function MangaCard({ manga, index = 0, variant = "default" }, ref) {
  const [modalOpen, setModalOpen] = useState(false);

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
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors group text-left w-full hover:bg-foreground/5"
        >
          <img
            src={manga.images.webp.image_url}
            alt={manga.title}
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
        
        <MangaDetailModal
          mangaId={manga.anilist_id}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="block group text-left w-full"
      >
        {/* Image with simple hover effect */}
        <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-2 bg-muted">
          <img
            src={manga.images.webp.image_url}
            alt={manga.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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
      
      <MangaDetailModal
        mangaId={manga.anilist_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}));
