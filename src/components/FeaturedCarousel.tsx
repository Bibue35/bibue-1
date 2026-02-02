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
      <div className="relative aspect-[4/5] sm:aspect-[16/9] overflow-hidden bg-muted animate-pulse" />
    );
  }

  if (!currentItem) return null;

  return (
    <>
      {/* Full-bleed embedded hero - no card styling */}
      <div className="relative overflow-hidden group -mx-3 sm:mx-0 sm:rounded-2xl">
        {/* Background Image - taller on mobile for immersive feel */}
        <div className="relative aspect-[3/4] sm:aspect-[16/9] overflow-hidden">
          <img
            src={currentItem.images.webp.large_image_url || currentItem.images.webp.image_url}
            alt={currentItem.title}
            className="w-full h-full object-cover object-top transition-transform duration-700"
          />
          
          {/* Smooth gradient that blends into page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content - positioned to feel integrated */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:p-6 md:p-8">
          <div className="max-w-xl">
            {/* Rank indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-5xl sm:text-6xl font-black text-foreground/10 leading-none">
                #{currentIndex + 1}
              </span>
              {currentItem.status === "Currently Airing" && (
                <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
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

            {/* Meta row - minimal and clean */}
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              {currentItem.score && (
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {formatScore(currentItem.score)}
                </span>
              )}
              {currentItem.year && <span>{currentItem.year}</span>}
              {currentItem.episodes && <span>{currentItem.episodes} eps</span>}
              {currentItem.genres?.slice(0, 2).map((genre) => (
                <span key={genre.mal_id} className="hidden sm:inline">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Action buttons - cleaner styling */}
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

        {/* Subtle swipe hint on mobile */}
        {items.length > 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 sm:hidden">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentIndex
                    ? "bg-foreground w-4"
                    : "bg-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Desktop navigation arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Desktop dots */}
            <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-1.5">
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
          </>
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
