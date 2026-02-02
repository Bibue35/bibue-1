import { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
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
          "absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center",
          "transition-opacity duration-200",
          pullDistance > 10 ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 50, 8),
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm",
            "border border-border/50 shadow-lg",
            "flex items-center justify-center",
            "transition-all duration-200",
            shouldTrigger && "bg-primary/10 border-primary/30"
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 text-muted-foreground transition-all duration-200",
              shouldTrigger && "text-primary",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? "transform 0.3s ease-out" : undefined,
        }}
      >
        {children}
      </div>

      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-40 pointer-events-none" />
      )}
    </div>
  );
}
