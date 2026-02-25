import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  SkipBack, SkipForward, Settings, PictureInPicture2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";

interface VideoPlayerProps {
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
  totalEpisodes: number;
  thumbnail?: string;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  animeId,
  animeTitle,
  episodeNumber,
  totalEpisodes,
  thumbnail,
  onPrevEpisode,
  onNextEpisode,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime] = useState(0);
  const [duration] = useState(24 * 60); // 24 min placeholder
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activateMiniPlayer } = useMiniPlayer();

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [isPlaying]);

  // Simulate buffering on play
  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsBuffering(true);
      setTimeout(() => setIsBuffering(false), 800);
    }
    setIsPlaying(!isPlaying);
    resetHideTimer();
  };

  // Simulate progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return p + 0.07;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePiP = () => {
    activateMiniPlayer({
      animeId,
      animeTitle,
      episodeNumber,
      totalEpisodes,
      thumbnail,
    });
  };

  const handleSeek = (value: number[]) => {
    setProgress(value[0]);
    resetHideTimer();
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const simulatedCurrentTime = (progress / 100) * duration;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer select-none",
        isFullscreen && "rounded-none"
      )}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={(e) => {
        // Only play/pause if clicking the video area, not controls
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        handlePlayPause();
      }}
    >
      {/* Thumbnail / Video Area */}
      <div className="absolute inset-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${animeTitle} Episode ${episodeNumber}`}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isPlaying && "scale-105 brightness-75"
            )}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/30 to-background" />
        )}
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Center play button (when paused) */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-2xl hover:bg-primary transition-all hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground fill-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Episode title overlay (top) */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 p-3 sm:p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        data-controls
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-wider font-medium">
              Now Playing
            </p>
            <h3 className="text-white text-sm sm:text-base font-bold line-clamp-1 mt-0.5">
              {animeTitle}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              Episode {episodeNumber} of {totalEpisodes}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        data-controls
      >
        {/* Progress bar */}
        <div className="px-3 sm:px-4 mb-1">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="h-1.5 cursor-pointer [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 pb-2 sm:pb-3">
          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className="p-1.5 sm:p-2 text-white hover:text-primary transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            )}
          </button>

          {/* Skip backward */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevEpisode?.();
            }}
            disabled={episodeNumber <= 1}
            className="p-1.5 text-white/70 hover:text-white transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Skip forward */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextEpisode?.();
            }}
            disabled={episodeNumber >= totalEpisodes}
            className="p-1.5 text-white/70 hover:text-white transition-colors disabled:opacity-30"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Time */}
          <span className="text-white/70 text-[10px] sm:text-xs font-mono ml-1 tabular-nums">
            {formatTime(simulatedCurrentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-1 group/vol">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-white/70 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* PiP */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePiP();
            }}
            className="p-1.5 text-white/70 hover:text-white transition-colors"
          >
            <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreen();
            }}
            className="p-1.5 text-white/70 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
