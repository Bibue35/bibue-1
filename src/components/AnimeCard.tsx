import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
}

export function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
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
          {anime.score && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-foreground fill-foreground" />
              <span className="text-xs sm:text-sm font-medium">{formatScore(anime.score)}</span>
            </div>
          )}
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
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 sm:mb-3 liquid-glass">
        <img
          src={anime.images.webp.image_url}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full liquid-glass-strong text-xs font-medium">
            <Star className="w-3 h-3 text-foreground fill-foreground" />
            {formatScore(anime.score)}
          </div>
        )}

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {anime.genres?.slice(0, 3).map(g => g.name).join(" • ")}
          </p>
        </div>
      </div>

      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-foreground/80 transition-colors">
        {anime.title}
      </h3>
    </Link>
  );
}
