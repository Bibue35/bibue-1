import { useState, useEffect, lazy, Suspense, useMemo, memo } from "react";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { HeroSkeleton } from "./skeletons";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

const HeroSynopsis = memo(function HeroSynopsis({ text }: { text?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return (
    <p className="text-white/60 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
      {translated}
    </p>
  );
});

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLanguage();
  
  const featured = featuredAnime?.[selectedIndex];

  // Preload first hero image for LCP
  useEffect(() => {
    if (!featuredAnime?.length) return;
    const url = featuredAnime[0].images.webp.large_image_url;
    if (!url || document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [featuredAnime]);

  // Auto-rotate every 8s
  useEffect(() => {
    if (!featuredAnime?.length) return;
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % Math.min(featuredAnime.length, 4));
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredAnime?.length]);

  if (isLoading || !featured) {
    return <HeroSkeleton variant="full" />;
  }

  return (
    <section aria-label="Featured anime" className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
      {/* Full-bleed background image — takes 70%+ viewport */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full transform-gpu">
          {featuredAnime?.slice(0, 4).map((anime, index) => {
            const isActive = index === selectedIndex;
            const isFirst = index === 0;
            const imgSrc = anime.images.webp.large_image_url;
            return (
              <div
                key={anime.anilist_id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={imgSrc}
                  alt={isFirst ? `${anime.title} featured banner` : ""}
                  aria-hidden={!isFirst}
                  width={1920}
                  height={1080}
                  loading={isFirst || isActive ? "eager" : "lazy"}
                  decoding={isFirst || isActive ? "sync" : "async"}
                  sizes="100vw"
                  className="absolute inset-0 w-full h-full object-cover"
                  {...(isFirst || isActive ? { fetchPriority: "high" as any } : {})}
                />
              </div>
            );
          })}
        </div>
        {/* Overall darkening layer */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.2)' }} />
        {/* Strong left-side gradient for text readability */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)' }} />
        {/* Bottom gradient for content area */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, transparent 60%)' }} />
      </div>

      {/* Content overlaid on the bottom of the image */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10 pb-12 sm:pb-16 md:pb-20">
        <div className="flex items-end justify-between">
          <div className="max-w-xl pt-[25vh] sm:pt-[30vh]">
            {/* Rating pill */}
            {featured.score && (
              <div className="flex items-center gap-1.5 mb-5 sm:mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white/90">
                  <Star className="w-3.5 h-3.5 text-white/80 fill-white/80" />
                  {formatScore(featured.score)} Rating
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sacred mb-4 sm:mb-5 tracking-wide leading-[1.1] text-white">
              {featured.title}
            </h1>

            {/* Genres */}
            {featured.genres && featured.genres.length > 0 && (
              <div className="flex gap-2 mb-4 sm:mb-5">
                {featured.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="px-3 py-1 rounded-full border border-white/20 text-xs sm:text-sm font-medium text-white/70"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <HeroSynopsis text={featured.synopsis} />

            {/* CTA */}
            <Button 
              size="lg"
              variant="primary" 
              className="gap-2 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 rounded-full"
              onClick={() => setModalOpen(true)}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("hero.watchNow")}
            </Button>
          </div>

          {/* Side preview cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            {featuredAnime?.slice(0, 4).filter((_, i) => i !== selectedIndex).slice(0, 3).map((anime) => {
              const originalIndex = featuredAnime.findIndex(a => a.anilist_id === anime.anilist_id);
              return (
                <button
                  key={anime.anilist_id}
                  onClick={() => setSelectedIndex(originalIndex)}
                  className={cn(
                    "w-40 xl:w-44 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                    "border-foreground/10 hover:border-primary/40 shadow-lg"
                  )}
                >
                  <img
                    src={anime.images.webp.large_image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {featuredAnime?.slice(0, 4).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "h-1 sm:h-1.5 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? "w-6 sm:w-8 bg-primary" 
                : "w-1.5 sm:w-2 bg-foreground/30 hover:bg-foreground/50"
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
