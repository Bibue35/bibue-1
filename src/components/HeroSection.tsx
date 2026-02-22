import { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { HeroSkeleton } from "./skeletons";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  featuredAnime?: Anime[];
  isLoading?: boolean;
}

function HeroSynopsis({ text }: { text?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return (
    <p className="text-foreground/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
      {translated}
    </p>
  );
}

export function HeroSection({ featuredAnime, isLoading }: HeroSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const parallaxRef = useRef<HTMLDivElement>(null);

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

  // Parallax scroll effect — desktop only
  useEffect(() => {
    if (isMobile) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const scrollY = window.scrollY;
          parallaxRef.current.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

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
    <section aria-label="Featured anime" className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[90vh] flex items-end overflow-hidden">
      {/* Full-bleed background image with parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={parallaxRef} className="relative w-full h-[120%] -top-[10%] transform-gpu will-change-transform">
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
                  fetchPriority={isFirst || isActive ? "high" : "auto"}
                  sizes="100vw"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
        {/* Minimal gradient — let image breathe, just enough for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      {/* Content overlaid on the bottom of the image */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-lg">
          {/* Genres — 2 max */}
          {featured.genres && featured.genres.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {featured.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.mal_id}
                  className="px-2.5 py-0.5 rounded-full bg-foreground/10 backdrop-blur-sm text-xs font-medium text-foreground/80"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Title — large, bold, readable in 1 second */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sacred mb-2 sm:mb-3 tracking-wide leading-[1.1]">
            {featured.title}
          </h1>

          {/* Rating — single number */}
          {featured.score && (
            <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm sm:text-base font-semibold">{formatScore(featured.score)}</span>
            </div>
          )}

          <HeroSynopsis text={featured.synopsis} />

          {/* Single CTA */}
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
