import { Link } from "react-router-dom";
import { Star, BookOpen, Calendar } from "lucide-react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "compact";
}

export function MangaCard({ manga, index = 0, variant = "default" }: MangaCardProps) {
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
      <Link
        to={`/manga/${manga.mal_id}`}
        className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl liquid-glass-subtle hover:bg-foreground/5 transition-all group"
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
      </Link>
    );
  }

  return (
    <Link
      to={`/manga/${manga.mal_id}`}
      className={cn(
        "block group animate-fade-up"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 sm:mb-3 divine-card">
        <img
          src={manga.images.webp.image_url}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Score badge - always visible */}
        {manga.score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full liquid-glass-strong text-xs font-medium">
            <Star className="w-3 h-3 text-foreground fill-foreground" />
            {formatScore(manga.score)}
          </div>
        )}

        {/* Year badge - always visible */}
        {publishedYear && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full liquid-glass-strong text-xs">
            {publishedYear}
          </div>
        )}

        {/* Bottom info bar - always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[60%]">
              {manga.genres?.slice(0, 2).map(g => g.name).join(" • ")}
            </span>
            <span className="flex items-center gap-1">
              {chapterCount ? (
                <>
                  <BookOpen className="w-3 h-3" />
                  {chapterCount} ch
                </>
              ) : volumeCount ? (
                <>
                  <BookOpen className="w-3 h-3" />
                  {volumeCount} vol
                </>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-foreground/80 transition-colors">
        {manga.title}
      </h3>
    </Link>
  );
}
