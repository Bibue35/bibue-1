import { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));
import { Play, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime } from "@/lib/api";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { HeroSkeleton } from "./skeletons";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

function HeroSynopsis({ text }: { text?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return (
    <p className="hidden xs:block text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-3">
      {translated}
    </p>
  );
}

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { t, language } = useLanguage();
  
  const featured = featuredAnime?.[selectedIndex];
  const sideCards = featuredAnime?.slice(0, 4).filter((_, i) => i !== selectedIndex) || [];
  const preloadedRef = useRef<HTMLLinkElement[]>([]);

  // Preload hero images so LCP image is discovered early
  useEffect(() => {
    if (!featuredAnime?.length) return;
    // Clean up old preloads
    preloadedRef.current.forEach((l) => l.remove());
    preloadedRef.current = [];
    featuredAnime.slice(0, 3).forEach((item) => {
      const url = item.images.webp.large_image_url;
      if (!url) return;
      if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      preloadedRef.current.push(link);
    });
    return () => {
      preloadedRef.current.forEach((l) => l.remove());
      preloadedRef.current = [];
    };
  }, [featuredAnime]);

  // Auto-rotate featured anime every 8 seconds
  useEffect(() => {
    if (!featuredAnime?.length) return;
    
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % Math.min(featuredAnime.length, 4));
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredAnime?.length]);

  const handleSideCardClick = (anime: Anime) => {
    const index = featuredAnime?.findIndex((a) => a.anilist_id === anime.anilist_id);
    if (index !== undefined && index >= 0) {
      setSelectedIndex(index);
    }
  };

  if (isLoading || !featured) {
    return <HeroSkeleton variant="full" />;
  }

  return (
    <section aria-label="Featured anime" className="relative min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with smooth transition */}
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Spline
            scene="https://prod.spline.design/5c61cf31-df4d-4c99-a1bd-92034a630a99/scene.splinecode"
            className="absolute inset-0 w-full h-full"
          />
        </Suspense>
      </div>

      {/* Anime background images */}
      <div className="absolute inset-0 z-[1]">
        <div className="relative w-full h-full transform-gpu">
          {featuredAnime?.slice(0, 4).map((anime, index) => {
            const isActive = index === selectedIndex;
            const isFirstImage = index === 0;
            return (
              <img
                key={anime.anilist_id}
                src={anime.images.webp.large_image_url}
                alt={isFirstImage ? `${anime.title} featured banner` : ""}
                aria-hidden={!isFirstImage}
                width={1400}
                height={700}
                loading={isFirstImage || isActive ? "eager" : "lazy"}
                decoding={isFirstImage ? "sync" : "async"}
                // @ts-ignore - React 18.3+ supports fetchPriority
                fetchPriority={isFirstImage || isActive ? "high" : "auto"}
                sizes="100vw"
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 mix-blend-overlay opacity-60",
                  isActive ? "opacity-60" : "opacity-0"
                )}
              />
            );
          })}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10 pt-16 sm:pt-20">
        <div className="max-w-xl sm:max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-xs mb-3 sm:mb-6">
            <Star className="w-3 h-3 text-foreground fill-foreground" />
            <span className="font-medium">{formatScore(featured.score)} {t("hero.rating")}</span>
            {featured.status === "Currently Airing" && (
              <>
                <span className="mx-0.5 sm:mx-1 opacity-50">•</span>
                <span className="text-primary font-medium">{t("hero.airing")}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-sacred mb-1.5 sm:mb-3 tracking-wide leading-tight">
            {featured.title}
          </h1>

          {/* Japanese title - only show when language is Japanese */}
          {featured.title_japanese && language === "ja" && (
            <p className="font-jp text-sm sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-6">
              {featured.title_japanese}
            </p>
          )}

          {/* Genres */}
          {featured.genres && featured.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-6">
              {featured.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.mal_id}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-xs font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <HeroSynopsis text={featured.synopsis} />

          {/* Single CTA Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button 
              size="default"
              variant="primary" 
              className="gap-2 text-sm sm:text-base h-9 sm:h-11 px-4 sm:px-6"
              onClick={() => setModalOpen(true)}
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t("hero.watchNow")}
            </Button>
          </div>
        </div>
      </div>

      {/* Side preview cards - Clickable to change hero */}
      <div className="absolute right-4 sm:right-8 top-[60%] -translate-y-1/2 hidden xl:flex flex-col gap-4">
        {sideCards.map((anime, index) => (
          <button
            key={anime.anilist_id}
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
              alt={`${anime.title} cover art`}
              width={150}
              height={225}
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
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {featuredAnime?.slice(0, 4).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? "w-6 sm:w-8 bg-primary" 
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {modalOpen && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={featured.anilist_id}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </section>
  );
}
