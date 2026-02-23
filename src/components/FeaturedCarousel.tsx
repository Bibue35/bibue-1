import { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from "react";
import { ChevronLeft, ChevronRight, Play, Star, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Anime, formatScore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { HeroSkeleton } from "./skeletons";
import { useIsMobile } from "@/hooks/use-mobile";
interface FeaturedCarouselProps {
  items: Anime[];
  isLoading?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const FeaturedCarousel = memo(function FeaturedCarousel({ 
  items, 
  isLoading = false,
  autoPlay = true,
  autoPlayInterval = 6000,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  // Use ref for parallax to avoid re-renders on scroll
  const parallaxRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isTouchSwiping = useRef(false);

  const currentItem = items[currentIndex];

  // Preload hero images so LCP image is discovered early
  useEffect(() => {
    if (items.length === 0) return;
    const preloaded: HTMLLinkElement[] = [];
    items.slice(0, 3).forEach((item) => {
      const url = item.images.webp.large_image_url || item.images.webp.image_url;
      if (!url) return;
      // Avoid duplicate preloads
      if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      preloaded.push(link);
    });
    return () => {
      preloaded.forEach((l) => l.remove());
    };
  }, [items]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, items.length]);

  // Optimized scroll parallax using IntersectionObserver + scroll offset
  // Avoids getBoundingClientRect which triggers forced reflows
  const scrollYRef = useRef(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(el);

    let rafId: number;
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking && isVisibleRef.current) {
        rafId = requestAnimationFrame(() => {
          const delta = window.scrollY - lastScrollY;
          lastScrollY = window.scrollY;
          scrollYRef.current = Math.max(0, Math.min(40, scrollYRef.current + delta * 0.1));
          // Apply directly to DOM — no React re-render
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translate3d(0, ${-scrollYRef.current}px, 0) scale(1.1)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePlay = useCallback(() => {
    if (currentItem) {
      navigate(`/anime/${currentItem.anilist_id}`, { state: { episode: 1 } });
    }
  }, [currentItem, navigate]);

  const handleInfo = useCallback(() => {
    if (currentItem) {
      setSelectedAnimeId(currentItem.anilist_id);
      setModalOpen(true);
    }
  }, [currentItem]);

  // Touch swipe handlers for mobile carousel navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isTouchSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (!isTouchSwiping.current && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isTouchSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouchSwiping.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      // Haptic feedback
      if ("vibrate" in navigator) navigator.vibrate(15);
    }
    isTouchSwiping.current = false;
  }, [handleNext, handlePrev]);

  if (isLoading) {
    return <HeroSkeleton variant="carousel" />;
  }

  if (!currentItem) return null;

  return (
    <>
      {/* Hero with scroll parallax - simplified for performance */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Featured anime carousel"
        aria-roledescription="carousel"
        className="relative py-4 sm:py-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative group mx-auto">
          {/* Main hero card - removed 3D tilt for performance */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl">
            {/* Background Image with GPU-accelerated parallax */}
            <div className="relative aspect-[3/4] sm:aspect-[16/9] overflow-hidden transform-gpu">
              <img
                ref={parallaxRef}
                src={currentItem.images.webp.large_image_url || currentItem.images.webp.image_url}
                alt={`${currentItem.title} featured banner`}
                width={1200}
                height={675}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="100vw"
                className="w-full h-full object-cover object-top will-change-transform"
                style={{
                  transform: `translate3d(0, 0, 0) scale(1.1)`,
                }}
              />
              
              {/* Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="max-w-xl">
                {/* Status badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold">
                    #{currentIndex + 1} Featured
                  </span>
                  {currentItem.status === "Currently Airing" && (
                    <span className="px-2 py-1 rounded-lg bg-background/60 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider">
                      Airing
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl line-clamp-2 mb-1">
                  {currentItem.title}
                </h2>

                {/* Japanese title */}
                {currentItem.title_japanese && (
                  <p className="font-jp text-sm text-muted-foreground mb-3 line-clamp-1">
                    {currentItem.title_japanese}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground flex-wrap">
                  {currentItem.score && (
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      {formatScore(currentItem.score)}
                    </span>
                  )}
                  {currentItem.year && <span>{currentItem.year}</span>}
                  {currentItem.episodes && <span>{currentItem.episodes} eps</span>}
                  {currentItem.genres?.slice(0, 2).map((genre) => (
                    <span key={genre.mal_id} className="hidden sm:inline px-2 py-0.5 rounded-md bg-muted/50 text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <Button 
                    size="lg" 
                    onClick={handlePlay}
                    className="gap-2 rounded-full px-6"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleInfo}
                    className="gap-2 rounded-full px-6 bg-background/50 backdrop-blur-sm border-foreground/20"
                  >
                    <Info className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel indicators */}
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 sm:gap-2 mt-4">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1} of ${items.length}`}
                  aria-current={i === currentIndex ? "true" : undefined}
                  className={cn(
                    "rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center",
                    i === currentIndex
                      ? "sm:w-8 sm:h-2"
                      : "sm:w-2 sm:h-2"
                  )}
                >
                  <span className={cn(
                    "block rounded-full transition-all duration-300",
                    i === currentIndex
                      ? "bg-primary w-8 h-2"
                      : "bg-muted-foreground/30 w-2.5 h-2.5 sm:w-2 sm:h-2 hover:bg-muted-foreground/50"
                  )} />
                </button>
              ))}
            </div>
          )}

          {/* Desktop navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {selectedAnimeId && modalOpen && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={selectedAnimeId}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </>
  );
});
