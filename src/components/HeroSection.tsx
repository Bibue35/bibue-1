import { useState, useEffect } from "react";
import { Play, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime } from "@/lib/api";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AnimeDetailModal } from "./AnimeDetailModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLanguage();
  
  const featured = featuredAnime?.[selectedIndex];
  const sideCards = featuredAnime?.slice(0, 4).filter((_, i) => i !== selectedIndex) || [];

  // Auto-rotate featured anime every 8 seconds
  useEffect(() => {
    if (!featuredAnime?.length) return;
    
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % Math.min(featuredAnime.length, 4));
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredAnime?.length]);

  const handleSideCardClick = (anime: Anime) => {
    const index = featuredAnime?.findIndex((a) => a.mal_id === anime.mal_id);
    if (index !== undefined && index >= 0) {
      setSelectedIndex(index);
    }
  };

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
              <div className="h-10 sm:h-12 w-32 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with smooth transition */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {featuredAnime?.slice(0, 4).map((anime, index) => (
            <img
              key={anime.mal_id}
              src={anime.images.webp.large_image_url}
              alt={anime.title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                index === selectedIndex ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-xs sm:text-sm mb-4 sm:mb-6">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-foreground fill-foreground" />
            <span className="font-medium">{formatScore(featured.score)} {t("hero.rating")}</span>
            {featured.status === "Currently Airing" && (
              <>
                <span className="mx-1 opacity-50">•</span>
                <span className="text-primary font-medium">{t("hero.airing")}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-sacred mb-2 sm:mb-3 tracking-wide">
            {featured.title}
          </h1>

          {/* Japanese title */}
          {featured.title_japanese && (
            <p className="font-jp text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6">
              {featured.title_japanese}
            </p>
          )}

          {/* Genres */}
          {featured.genres && featured.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {featured.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.mal_id}
                  className="px-2 sm:px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-xs sm:text-sm font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-6 sm:mb-8 line-clamp-2 sm:line-clamp-3">
            {featured.synopsis}
          </p>

          {/* Single CTA Button */}
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              size="lg" 
              variant="primary" 
              className="gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Play className="w-4 h-4" />
              {t("hero.watchNow")}
            </Button>
          </div>
        </div>
      </div>

      {/* Side preview cards - Clickable to change hero */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
        {sideCards.map((anime, index) => (
          <button
            key={anime.mal_id}
            onClick={() => handleSideCardClick(anime)}
            className={cn(
              "w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-border/50 transition-transform duration-200 group relative hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            style={{ 
              transform: index === 1 ? 'translateX(2rem)' : undefined
            }}
          >
            <img
              src={anime.images.webp.image_url}
              alt={anime.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay with episode info */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
              <div className="text-xs font-medium truncate w-full">
                {anime.episodes && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {anime.episodes} ep
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featuredAnime?.slice(0, 4).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? "w-8 bg-primary" 
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <AnimeDetailModal
        animeId={featured.mal_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
}
