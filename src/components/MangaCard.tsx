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
      {/* Image only - clean card */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 divine-card">
        <img
          src={manga.images.webp.image_url}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Title underneath */}
      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
        {manga.title}
      </h3>

      {/* Metadata underneath - always visible */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
        {manga.score && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-foreground fill-foreground" />
            {formatScore(manga.score)}
          </span>
        )}
        {publishedYear && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {publishedYear}
          </span>
        )}
        {chapterCount ? (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {chapterCount} ch
          </span>
        ) : volumeCount ? (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {volumeCount} vol
          </span>
        ) : null}
        {manga.status === "Publishing" && (
          <span className="text-primary font-medium">Ongoing</span>
        )}
      </div>
    </Link>
  );
}
