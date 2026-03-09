import { memo } from "react";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  variant?: "default" | "compact" | "mobile";
  className?: string;
}

export const CardSkeleton = memo(function CardSkeleton({ 
  variant = "default",
  className 
}: CardSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex gap-3 p-2 rounded-xl bg-card/50", className)}>
        <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg flex-shrink-0 skeleton-shimmer" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-10 rounded-full skeleton-shimmer" />
            <div className="h-4 w-12 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="aspect-[2/3] w-full rounded-xl skeleton-shimmer" />
        <div className="space-y-1.5 px-0.5">
          <div className="h-3 w-4/5 rounded skeleton-shimmer" />
          <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
        </div>
      </div>
    );
  }

  // Default card skeleton with premium shimmer
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
        {/* Score badge placeholder */}
        <div className="absolute top-2 left-2">
          <div className="h-5 w-10 rounded-full skeleton-shimmer" />
        </div>
        {/* Bookmark button placeholder */}
        <div className="absolute bottom-2 right-2">
          <div className="h-8 w-8 rounded-full skeleton-shimmer" />
        </div>
      </div>
      <div className="space-y-1.5 px-1">
        <div className="h-3.5 w-[85%] rounded skeleton-shimmer" />
        <div className="h-3 w-[60%] rounded skeleton-shimmer" />
      </div>
    </div>
  );
});

interface CardSkeletonGridProps {
  count?: number;
  variant?: "default" | "compact" | "mobile";
  className?: string;
  itemClassName?: string;
}

export const CardSkeletonRow = memo(function CardSkeletonRow({
  count = 6,
  variant = "default",
  className,
  itemClassName,
}: CardSkeletonGridProps) {
  const widthClass = variant === "compact" 
    ? "w-full" 
    : "w-32 sm:w-40 md:w-48";

  return (
    <div className={cn("flex gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("flex-shrink-0", widthClass, itemClassName)}>
          <CardSkeleton variant={variant} />
        </div>
      ))}
    </div>
  );
});
