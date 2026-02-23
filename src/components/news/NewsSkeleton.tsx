import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedNewsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main featured skeleton */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-auto lg:row-span-2 bg-muted">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Secondary featured skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-muted">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
