import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EpisodeCountdownProps {
  /** Unix timestamp (seconds) for next airing */
  airingAt: number;
  /** Next episode number */
  episode?: number;
  className?: string;
  compact?: boolean;
}

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "Airing now";
  
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function EpisodeCountdown({ airingAt, episode, className, compact = false }: EpisodeCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => airingAt - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(airingAt - Math.floor(Date.now() / 1000));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [airingAt]);

  if (secondsLeft < -3600) return null; // More than 1 hour ago, hide

  const isLive = secondsLeft <= 0;

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-sm",
        isLive 
          ? "bg-green-600 text-white animate-pulse" 
          : "bg-background/90 text-foreground backdrop-blur-sm",
        className
      )}>
        <Clock className="w-3 h-3" />
        {isLive ? "LIVE" : formatCountdown(secondsLeft)}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs",
      isLive ? "text-green-400" : "text-muted-foreground",
      className
    )}>
      <Clock className={cn("w-3.5 h-3.5", isLive && "animate-pulse")} />
      <span>
        {episode ? `Ep ${episode} · ` : ""}
        {isLive ? "Airing now" : `in ${formatCountdown(secondsLeft)}`}
      </span>
    </div>
  );
}
