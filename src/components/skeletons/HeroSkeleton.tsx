import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HeroSkeletonProps {
  variant?: "carousel" | "full";
  className?: string;
}

export const HeroSkeleton = memo(function HeroSkeleton({ 
  variant = "carousel",
  className 
}: HeroSkeletonProps) {
  if (variant === "full") {
    // Full hero section skeleton (desktop)
    return (
      <section className={cn("relative min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-center", className)}>
        {/* Background gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-xl sm:max-w-2xl space-y-4">
            {/* Badge */}
            <Skeleton className="h-7 w-32 rounded-full" />
            
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-10 sm:h-14 md:h-16 w-3/4 rounded-xl" />
              <Skeleton className="h-6 sm:h-8 w-1/2 rounded-lg" />
            </div>
            
            {/* Genres */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            
            {/* Synopsis */}
            <div className="space-y-2 hidden sm:block">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            
            {/* CTA Button */}
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </div>
        
        {/* Side cards placeholder (desktop) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          <Skeleton className="w-24 sm:w-32 aspect-[2/3] rounded-2xl" />
          <Skeleton className="w-24 sm:w-32 aspect-[2/3] rounded-2xl translate-x-8" />
          <Skeleton className="w-24 sm:w-32 aspect-[2/3] rounded-2xl" />
        </div>
        
        {/* Progress indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          <Skeleton className="w-8 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
      </section>
    );
  }

  // Carousel skeleton (mobile)
  return (
    <div className={cn("relative py-4 sm:py-6", className)}>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        {/* Main image area */}
        <div className="relative aspect-[3/4] sm:aspect-[16/9]">
          <Skeleton className="absolute inset-0" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="max-w-xl space-y-3">
              {/* Status badges */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
              
              {/* Title */}
              <Skeleton className="h-8 sm:h-10 w-3/4 rounded-lg" />
              
              {/* Japanese title */}
              <Skeleton className="h-4 w-1/2 rounded" />
              
              {/* Meta row */}
              <div className="flex gap-3">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-11 w-28 rounded-full" />
                <Skeleton className="h-11 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carousel indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Skeleton className="w-8 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
      </div>
    </div>
  );
});
