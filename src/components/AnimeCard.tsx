import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Star, Calendar, Clock } from "lucide-react";
import { Anime } from "@/lib/api";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

export function AnimeCard({ anime, index = 0, variant = "default" }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const rotateX = isHovered ? (mousePosition.y - 0.5) * -10 : 0;
  const rotateY = isHovered ? (mousePosition.x - 0.5) * 10 : 0;

  if (variant === "compact") {
    return (
      <Link
        to={`/anime/${anime.mal_id}`}
        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 transition-all duration-300"
      >
        <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={anime.images.webp.image_url}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-medium truncate group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {anime.score && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Star className="w-3 h-3 fill-current" />
                {formatScore(anime.score)}
              </span>
            )}
            {anime.episodes && (
              <span className="text-xs text-muted-foreground">
                {anime.episodes} eps
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        to={`/anime/${anime.mal_id}`}
        className="group relative aspect-[16/9] rounded-2xl overflow-hidden"
      >
        <img
          src={anime.images.webp.large_image_url}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            {anime.score && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-primary font-display text-sm">
                <Star className="w-4 h-4 fill-current" />
                {formatScore(anime.score)}
              </span>
            )}
            {anime.season && anime.year && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 backdrop-blur-sm text-secondary font-display text-sm capitalize">
                <Calendar className="w-4 h-4" />
                {anime.season} {anime.year}
              </span>
            )}
          </div>
          
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-2 group-hover:text-primary transition-colors">
            {anime.title}
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-base line-clamp-2 max-w-2xl mb-4">
            {anime.synopsis}
          </p>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-anime text-primary-foreground font-display uppercase tracking-wider shadow-neon hover:shadow-neon-lg transition-shadow">
              <Play className="w-5 h-5" />
              Watch Now
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/anime/${anime.mal_id}`}>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className="group relative animate-fade-in"
        style={{
          animationDelay: `${index * 50}ms`,
          perspective: "1000px",
        }}
      >
        <div
          className="relative rounded-xl overflow-hidden transition-all duration-300"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Image */}
          <div className="aspect-[2/3] relative overflow-hidden">
            <img
              src={anime.images.webp.large_image_url}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Rank badge */}
            {anime.rank && anime.rank <= 10 && (
              <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-gradient-anime flex items-center justify-center font-display font-bold text-primary-foreground shadow-neon">
                #{anime.rank}
              </div>
            )}
            
            {/* Score badge */}
            {anime.score && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass flex items-center gap-1 font-display text-sm">
                <Star className="w-4 h-4 text-primary fill-primary" />
                {formatScore(anime.score)}
              </div>
            )}
            
            {/* Play button on hover */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center shadow-neon animate-pulse-glow">
                <Play className="w-8 h-8 text-primary fill-primary ml-1" />
              </div>
            </div>
          </div>
          
          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 glass-strong">
            <h3 className="font-display font-semibold text-sm truncate mb-1">
              {anime.title}
            </h3>
            <p className="font-jp text-xs text-muted-foreground truncate mb-2">
              {anime.title_japanese}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {anime.episodes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {anime.episodes} eps
                </span>
              )}
              {anime.status && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-display",
                  anime.status === "Currently Airing" && "bg-neon-green/20 text-neon-green",
                  anime.status === "Finished Airing" && "bg-primary/20 text-primary"
                )}>
                  {anime.status === "Currently Airing" ? "Airing" : "Finished"}
                </span>
              )}
            </div>
          </div>
          
          {/* Glow effect */}
          <div
            className={cn(
              "absolute -inset-[2px] rounded-xl transition-opacity duration-300 pointer-events-none",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--primary) / 0.4), transparent 50%)`,
            }}
          />
        </div>
        
        {/* Shadow */}
        <div
          className={cn(
            "absolute -inset-1 -z-10 rounded-xl transition-all duration-300",
            isHovered ? "opacity-100 blur-xl" : "opacity-0"
          )}
          style={{
            background: "var(--gradient-anime)",
          }}
        />
      </div>
    </Link>
  );
}
