import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
        <Skeleton className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="aspect-[2/3] w-full rounded-xl" />
        <div className="space-y-1.5 px-0.5">
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-2.5 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
        <Skeleton className="absolute inset-0" />
        {/* Score badge placeholder */}
        <div className="absolute top-2 left-2">
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        {/* Bookmark button placeholder */}
        <div className="absolute bottom-2 right-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3.5 w-[85%] rounded" />
        <Skeleton className="h-3 w-[60%] rounded" />
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
    : "w-28 sm:w-36 md:w-44";

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
