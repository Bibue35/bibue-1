import { Link } from "react-router-dom";
import { Star, Calendar, Play } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
}

export function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
  // Format aired date
  const getAiredInfo = () => {
    if (anime.aired?.from) {
      const date = new Date(anime.aired.from);
      return date.getFullYear().toString();
    }
    if (anime.year) return anime.year.toString();
    return null;
  };

  const airedYear = getAiredInfo();
  const episodeCount = anime.episodes;

  if (variant === "compact") {
    return (
      <Link
        to={`/anime/${anime.mal_id}`}
        className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl liquid-glass-subtle hover:bg-foreground/5 transition-all group"
      >
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-foreground/80 transition-colors">
            {anime.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {anime.genres?.slice(0, 2).map(g => g.name).join(", ")}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {anime.score && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-foreground fill-foreground" />
                <span className="text-xs sm:text-sm font-medium">{formatScore(anime.score)}</span>
              </div>
            )}
            {airedYear && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{airedYear}</span>
              </div>
            )}
            {episodeCount && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Play className="w-3 h-3" />
                <span className="text-xs">{episodeCount} ep</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className={cn(
        "block group animate-fade-up"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image only - clean card */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 divine-card">
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Title underneath */}
      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
        {anime.title}
      </h3>

      {/* Metadata underneath - always visible */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
        {anime.score && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-foreground fill-foreground" />
            {formatScore(anime.score)}
          </span>
        )}
        {airedYear && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {airedYear}
          </span>
        )}
        {episodeCount && (
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {episodeCount} ep
          </span>
        )}
        {anime.status === "Currently Airing" && (
          <span className="text-primary font-medium">Airing</span>
        )}
      </div>
    </Link>
  );
}
