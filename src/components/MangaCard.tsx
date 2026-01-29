import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Star, User } from "lucide-react";
import { Manga, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MangaCardProps {
  manga: Manga;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

export function MangaCard({ manga, index = 0, variant = "default" }: MangaCardProps) {
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

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "manga": return "from-neon-purple to-neon-blue";
      case "manhwa": return "from-neon-pink to-neon-orange";
      case "manhua": return "from-neon-cyan to-neon-green";
      default: return "from-neon-purple to-neon-blue";
    }
  };

  if (variant === "compact") {
    return (
      <Link
        to={`/manga/${manga.mal_id}`}
        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-accent/10 transition-all duration-300"
      >
        <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={manga.images.webp.image_url}
            alt={manga.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-medium truncate group-hover:text-accent transition-colors">
            {manga.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {manga.score && (
              <span className="flex items-center gap-1 text-xs text-accent">
                <Star className="w-3 h-3 fill-current" />
                {formatScore(manga.score)}
              </span>
            )}
            {manga.type && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded bg-gradient-to-r text-primary-foreground",
                getTypeColor(manga.type)
              )}>
                {manga.type}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/manga/${manga.mal_id}`}>
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
            transform: `rotateX(${isHovered ? (mousePosition.y - 0.5) * -10 : 0}deg) rotateY(${isHovered ? (mousePosition.x - 0.5) * 10 : 0}deg) scale(${isHovered ? 1.02 : 1})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Image */}
          <div className="aspect-[2/3] relative overflow-hidden">
            <img
              src={manga.images.webp.large_image_url}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Type badge */}
            {manga.type && (
              <div className={cn(
                "absolute top-3 left-3 px-3 py-1 rounded-full font-display text-xs uppercase tracking-wider text-primary-foreground bg-gradient-to-r",
                getTypeColor(manga.type)
              )}>
                {manga.type}
              </div>
            )}
            
            {/* Score badge */}
            {manga.score && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass flex items-center gap-1 font-display text-sm">
                <Star className="w-4 h-4 text-accent fill-accent" />
                {formatScore(manga.score)}
              </div>
            )}
            
            {/* Read button on hover */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center shadow-neon-pink animate-pulse-glow">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 glass-strong">
            <h3 className="font-display font-semibold text-sm truncate mb-1">
              {manga.title}
            </h3>
            <p className="font-jp text-xs text-muted-foreground truncate mb-2">
              {manga.title_japanese}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {manga.chapters && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {manga.chapters} ch
                </span>
              )}
              {manga.authors && manga.authors[0] && (
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3" />
                  {manga.authors[0].name}
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
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--accent) / 0.4), transparent 50%)`,
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
            background: "var(--gradient-manga)",
          }}
        />
      </div>
    </Link>
  );
}
