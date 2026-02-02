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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="relative aspect-[4/5] sm:aspect-[16/9] overflow-hidden bg-muted animate-pulse rounded-2xl" />
    );
  }

  if (!currentItem) return null;

  return (
    <>
      {/* Hero with soft parallax tilt on hover */}
      <div className="relative py-4 sm:py-6">
        <div 
          ref={cardRef}
          className="relative group mx-auto"
          style={{ perspective: "1000px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Main hero card */}
          <div 
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Background Image */}
            <div className="relative aspect-[3/4] sm:aspect-[16/9] overflow-hidden">
              <img
                src={currentItem.images.webp.large_image_url || currentItem.images.webp.image_url}
                alt={currentItem.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
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
            <div className="flex items-center justify-center gap-2 mt-4">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
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
