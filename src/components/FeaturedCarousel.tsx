import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Star, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Anime, formatScore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimeDetailModal } from "./AnimeDetailModal";

interface FeaturedCarouselProps {
  items: Anime[];
  isLoading?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function FeaturedCarousel({ 
  items, 
  isLoading = false,
  autoPlay = true,
  autoPlayInterval = 6000,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = items[currentIndex];

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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePlay = () => {
    if (currentItem) {
      navigate(`/anime/${currentItem.mal_id}`, { state: { episode: 1 } });
    }
  };

  const handleInfo = () => {
    if (currentItem) {
      setSelectedAnimeId(currentItem.mal_id);
      setModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-muted animate-pulse" />
    );
  }

  if (!currentItem) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl group">
        {/* Background Image with Parallax effect */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
          <img
            src={currentItem.images.webp.large_image_url || currentItem.images.webp.image_url}
            alt={currentItem.title}
            className="w-full h-full object-cover transition-transform duration-700"
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-xl">
            {/* Genre badges */}
            <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
              {currentItem.genres?.slice(0, 3).map((genre) => (
                <span
                  key={genre.mal_id}
                  className="px-2 py-0.5 rounded-full bg-foreground/10 backdrop-blur-sm text-foreground/90 text-[10px] sm:text-xs font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl line-clamp-2 mb-2 sm:mb-3">
              {currentItem.title}
            </h2>

            {/* Japanese title */}
            {currentItem.title_japanese && (
              <p className="font-jp text-xs sm:text-sm text-foreground/70 mb-2 sm:mb-3 line-clamp-1">
                {currentItem.title_japanese}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-xs sm:text-sm text-foreground/80">
              {currentItem.score && (
                <span className="flex items-center gap-1 font-medium">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {formatScore(currentItem.score)}
                </span>
              )}
              {currentItem.year && <span>{currentItem.year}</span>}
              {currentItem.episodes && <span>{currentItem.episodes} episodes</span>}
              {currentItem.status && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] sm:text-xs">
                  {currentItem.status === "Currently Airing" ? "Airing" : currentItem.status}
                </span>
              )}
            </div>

            {/* Synopsis - hidden on small mobile */}
            <p className="hidden sm:block text-sm text-foreground/70 line-clamp-2 mb-4">
              {currentItem.synopsis}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                size="lg" 
                onClick={handlePlay}
                className="gap-2 rounded-full shadow-lg shadow-primary/30"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span className="hidden xs:inline">Watch Now</span>
                <span className="xs:hidden">Play</span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={handleInfo}
                className="gap-2 rounded-full"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">More Info</span>
                <span className="xs:hidden">Info</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation arrows - hidden on mobile, visible on hover for desktop */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {items.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex
                    ? "bg-primary w-6"
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {selectedAnimeId && (
        <AnimeDetailModal
          animeId={selectedAnimeId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
}
