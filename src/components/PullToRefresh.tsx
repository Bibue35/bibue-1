import { ReactNode } from "react";
import { RefreshCw, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const {
    containerRef,
    isRefreshing,
    pullDistance,
    progress,
    shouldTrigger,
  } = usePullToRefresh({ onRefresh });

  return (
    <div ref={containerRef} className={cn("relative min-h-screen", className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center gap-1",
          "transition-opacity duration-200",
          pullDistance > 10 ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 60, 8),
        }}
      >
        <div
          className={cn(
            "w-11 h-11 rounded-full bg-background/95 backdrop-blur-sm",
            "border border-border/50 shadow-lg",
            "flex items-center justify-center",
            "transition-all duration-200",
            shouldTrigger && "bg-primary/10 border-primary/40 scale-110 shadow-primary/20"
          )}
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          ) : shouldTrigger ? (
            <RefreshCw
              className="w-5 h-5 text-primary transition-transform duration-150"
              style={{ transform: `rotate(${progress * 360}deg)` }}
            />
          ) : (
            <ArrowDown
              className="w-5 h-5 text-muted-foreground transition-all duration-150"
              style={{
                transform: `rotate(${progress * 180}deg)`,
                opacity: 0.5 + progress * 0.5,
              }}
            />
          )}
        </div>
        {/* Status text */}
        <span
          className={cn(
            "text-[10px] font-medium transition-opacity duration-150",
            shouldTrigger ? "text-primary" : "text-muted-foreground",
            pullDistance > 20 ? "opacity-100" : "opacity-0"
          )}
        >
          {isRefreshing ? "Refreshing…" : shouldTrigger ? "Release to refresh" : "Pull to refresh"}
        </span>
      </div>

      {/* Progress arc behind the indicator */}
      {pullDistance > 10 && !isRefreshing && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 z-[49] pointer-events-none"
          style={{ top: Math.max(pullDistance - 62, 6) }}
          width="48" height="48" viewBox="0 0 48 48"
        >
          <circle
            cx="24" cy="24" r="21"
            fill="none"
            className="stroke-primary/30"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 132} 132`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.1s ease-out" }}
          />
        </svg>
      )}

      {/* Content with pull transform */}
      <div
        className="pull-to-refresh-content"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? "transform 0.3s ease-out" : undefined,
        }}
      >
        {children}
      </div>

      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-background/10 backdrop-blur-[1px] z-40 pointer-events-none" />
      )}
    </div>
  );
}
