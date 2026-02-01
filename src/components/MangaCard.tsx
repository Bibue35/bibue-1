import { useState } from "react";
import { Star, BookOpen, Calendar } from "lucide-react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MangaDetailModal } from "./MangaDetailModal";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact";
}

export function MangaCard({ manga, index = 0, variant = "default" }: MangaCardProps) {
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
          className={cn(
            "flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all group text-left w-full",
            "liquid-glass-subtle hover:bg-foreground/5",
            "sun-glow moon-glow"
          )}
        >
          <img
            src={manga.images.webp.image_url}
            alt={manga.title}
            className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg"
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
          mangaId={manga.mal_id}
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
        className={cn(
          "block group animate-fade-up text-left w-full"
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Image with theme-specific hover effects */}
        <div className={cn(
          "relative aspect-[2/3] rounded-2xl overflow-hidden mb-2",
          "divine-card sun-glow moon-glow sun-rays-hover moon-reflection"
        )}>
          <img
            src={manga.images.webp.image_url}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Chapter count badge */}
          {chapterCount && (
            <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              C{chapterCount}
            </div>
          )}
        </div>

        {/* Title underneath */}
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
          {manga.title}
        </h3>

        {/* Score */}
        {manga.score && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs sm:text-sm font-medium">{formatScore(manga.score)}</span>
          </div>
        )}

        {/* Metadata underneath - always visible */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
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
        mangaId={manga.mal_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
