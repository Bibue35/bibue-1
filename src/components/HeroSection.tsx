import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime } from "@/lib/api";
import { formatScore } from "@/lib/api";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const featured = featuredAnime?.[0];

  if (isLoading || !featured) {
    return (
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl animate-pulse">
            <div className="h-4 w-24 bg-muted rounded-full mb-6" />
            <div className="h-10 sm:h-12 w-3/4 bg-muted rounded-2xl mb-4" />
            <div className="h-6 w-1/2 bg-muted rounded-xl mb-6" />
            <div className="h-16 sm:h-20 w-full bg-muted rounded-xl mb-8" />
            <div className="flex gap-3">
              <div className="h-10 sm:h-12 w-28 sm:w-32 bg-muted rounded-full" />
              <div className="h-10 sm:h-12 w-28 sm:w-32 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured.images.webp.large_image_url}
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm mb-4 sm:mb-6 animate-fade-up">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-foreground fill-foreground" />
            <span className="font-medium">{formatScore(featured.score)} Rating</span>
          </div>

          {/* Title */}
          <h1 
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-sacred mb-2 sm:mb-3 tracking-wide animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {featured.title}
          </h1>

          {/* Japanese title */}
          {featured.title_japanese && (
            <p 
              className="font-jp text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              {featured.title_japanese}
            </p>
          )}

          {/* Genres */}
          {featured.genres && featured.genres.length > 0 && (
            <div 
              className="flex flex-wrap gap-2 mb-4 sm:mb-6 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {featured.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.mal_id}
                  className="px-2 sm:px-3 py-1 rounded-full liquid-glass-subtle text-xs sm:text-sm font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p 
            className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-6 sm:mb-8 line-clamp-2 sm:line-clamp-3 animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            {featured.synopsis}
          </p>

          {/* CTA */}
          <div 
            className="flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button size="lg" variant="primary" className="gap-2">
              <Play className="w-4 h-4" />
              Watch Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
            >
              <Link to={`/anime/${featured.mal_id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating preview cards */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
        {featuredAnime?.slice(1, 4).map((anime, index) => (
          <Link
            key={anime.mal_id}
            to={`/anime/${anime.mal_id}`}
            className="w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden liquid-glass hover-lift animate-fade-up"
            style={{ 
              animationDelay: `${0.4 + index * 0.1}s`,
              transform: index === 1 ? 'translateX(2rem)' : undefined
            }}
          >
            <img
              src={anime.images.webp.image_url}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
