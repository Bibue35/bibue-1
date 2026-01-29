import { Play, Calendar, Star, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime } from "@/lib/api";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const featured = featuredAnime?.[0];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured?.images.webp.large_image_url || heroBg}
          alt="Hero background"
          className="w-full h-full object-cover scale-105 animate-pulse-glow"
          style={{ animationDuration: "10s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
      </div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-20 pt-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-6 animate-slide-right">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 font-display text-sm text-primary">
              <TrendingUp className="w-4 h-4" />
              #1 Trending
            </span>
            {featured?.season && featured?.year && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 font-display text-sm text-secondary capitalize">
                <Calendar className="w-4 h-4" />
                {featured.season} {featured.year}
              </span>
            )}
          </div>
          
          {/* Title */}
          <h1 
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {featured ? (
              <>
                <span className="gradient-text">{featured.title}</span>
              </>
            ) : (
              <>
                <span className="gradient-text">Discover</span>
                <br />
                <span className="text-foreground">Your Next</span>
                <br />
                <span className="gradient-text-manga">Adventure</span>
              </>
            )}
          </h1>
          
          {/* Japanese title */}
          {featured?.title_japanese && (
            <p 
              className="font-jp text-2xl md:text-3xl text-muted-foreground mb-6 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {featured.title_japanese}
            </p>
          )}
          
          {/* Stats */}
          {featured && (
            <div 
              className="flex flex-wrap items-center gap-4 mb-6 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              {featured.score && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="font-display font-bold">{formatScore(featured.score)}</span>
                  <span className="text-muted-foreground text-sm">Score</span>
                </div>
              )}
              {featured.episodes && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="font-display font-bold">{featured.episodes}</span>
                  <span className="text-muted-foreground text-sm">Episodes</span>
                </div>
              )}
              {featured.genres && featured.genres.length > 0 && (
                <div className="flex items-center gap-2">
                  {featured.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-3 py-1.5 rounded-lg glass text-sm font-display border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Synopsis */}
          <p 
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8 line-clamp-3 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            {featured?.synopsis || 
              "Explore the vast universe of anime and manga. Discover trending series, top-rated classics, and hidden gems. Your next favorite awaits."}
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-wrap items-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Button size="xl" variant="glow" className="group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Now
            </Button>
            <Button size="xl" variant="outline">
              Add to List
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          <span className="text-sm text-muted-foreground font-display uppercase tracking-wider">
            Scroll
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Floating cards preview */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 pr-8 animate-slide-left" style={{ animationDelay: "0.6s" }}>
        {featuredAnime?.slice(1, 4).map((anime, index) => (
          <div
            key={anime.mal_id}
            className={cn(
              "w-36 aspect-[2/3] rounded-xl overflow-hidden glass hover-lift cursor-pointer",
              index === 1 && "translate-x-8"
            )}
            style={{ animationDelay: `${0.7 + index * 0.1}s` }}
          >
            <img
              src={anime.images.webp.image_url}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
