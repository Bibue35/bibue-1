import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, X, Maximize2, ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const navigate = useNavigate();
  const { miniPlayer, closeMiniPlayer, setEpisode } = useMiniPlayer();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Position from bottom-right corner
  useEffect(() => {
    if (!miniPlayer.isActive) return;
    // Reset position when mini player activates
    setPosition({ x: 16, y: 16 });
  }, [miniPlayer.isActive]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = dragRef.current.startX - clientX;
      const deltaY = dragRef.current.startY - clientY;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, dragRef.current.initialY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const handleExpand = () => {
    if (miniPlayer.animeId) {
      closeMiniPlayer();
      navigate(`/anime/${miniPlayer.animeId}`, { 
        state: { episode: miniPlayer.episodeNumber } 
      });
    }
  };

  const handlePrevEpisode = () => {
    if (miniPlayer.episodeNumber > 1) {
      setEpisode(miniPlayer.episodeNumber - 1);
    }
  };

  const handleNextEpisode = () => {
    if (miniPlayer.episodeNumber < miniPlayer.totalEpisodes) {
      setEpisode(miniPlayer.episodeNumber + 1);
    }
  };

  if (!miniPlayer.isActive) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[9998] w-[300px] sm:w-[340px] rounded-xl overflow-hidden shadow-2xl",
        "bg-background/95 backdrop-blur-xl border border-border/50",
        "animate-scale-in",
        isDragging && "cursor-grabbing"
      )}
      style={{
        right: position.x,
        bottom: position.y,
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className="absolute top-0 left-0 right-0 h-6 z-10 cursor-grab flex items-center justify-center bg-gradient-to-b from-black/60 to-transparent"
      >
        <GripHorizontal className="w-4 h-4 text-white/60" />
      </div>

      {/* Video Thumbnail / Player Area */}
      <div className="relative aspect-video bg-black">
        {miniPlayer.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${miniPlayer.youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
            title={`${miniPlayer.animeTitle} - Episode ${miniPlayer.episodeNumber}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <>
            <img
              src={miniPlayer.thumbnail}
              alt={miniPlayer.animeTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white fill-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white" />
                )}
              </button>
            </div>
          </>
        )}

        {/* Close and Expand buttons */}
        <div className="absolute top-6 right-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMiniPlayer}
            className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1">{miniPlayer.animeTitle}</h4>
            <p className="text-xs text-muted-foreground">
              Episode {miniPlayer.episodeNumber} of {miniPlayer.totalEpisodes}
            </p>
          </div>

          {/* Episode Navigation */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevEpisode}
              disabled={miniPlayer.episodeNumber <= 1}
              className="h-7 w-7 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextEpisode}
              disabled={miniPlayer.episodeNumber >= miniPlayer.totalEpisodes}
              className="h-7 w-7 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
