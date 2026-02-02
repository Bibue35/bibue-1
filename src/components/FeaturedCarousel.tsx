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
      {/* 3D embedded hero with organic shape */}
      <div className="relative py-6 sm:py-8">
        {/* 3D perspective container */}
        <div 
          className="relative group mx-auto max-w-[90%] sm:max-w-full"
          style={{ perspective: "1200px" }}
        >
          {/* Main hero card with 3D transform and organic blob shape */}
          <div 
            className="relative overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            style={{ 
              transform: "rotateX(2deg) rotateY(-1deg)",
              transformStyle: "preserve-3d",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            }}
          >
            {/* Floating shadow underneath for 3D depth */}
            <div 
              className="absolute -inset-4 -z-10 opacity-40 blur-2xl"
              style={{ 
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--muted) / 0.5))",
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                transform: "translateZ(-50px) translateY(20px)",
              }}
            />

            {/* Background Image */}
            <div className="relative aspect-[4/5] sm:aspect-[16/9] overflow-hidden">
              <img
                src={currentItem.images.webp.large_image_url || currentItem.images.webp.image_url}
                alt={currentItem.title}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Depth gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/30" />
              
              {/* Inner glow edge for 3D effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 60px 20px hsl(var(--background) / 0.4)",
                }}
              />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 sm:px-8 sm:pb-10">
              <div className="max-w-xl">
                {/* Floating rank badge with 3D effect */}
                <div 
                  className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-foreground/10"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <span className="text-lg font-black text-primary">
                    #{currentIndex + 1}
                  </span>
                  {currentItem.status === "Currently Airing" && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
                      Airing
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl line-clamp-2 mb-1 drop-shadow-lg">
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
                    <span key={genre.mal_id} className="hidden sm:inline px-2 py-0.5 rounded-full bg-muted/50 text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <Button 
                    size="lg" 
                    onClick={handlePlay}
                    className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20"
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

          {/* Carousel indicators - floating below */}
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

          {/* Desktop navigation arrows - positioned outside blob */}
          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-card shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-card shadow-lg"
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
