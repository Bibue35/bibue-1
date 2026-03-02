import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  fallback?: string;
  /** Mark as high-priority LCP image (eager load, high fetchpriority) */
  priority?: boolean;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  fallback = "/placeholder.svg",
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priority images are always "in view"
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // skip observer for priority images
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  const imgSrc = hasError ? fallback : src;

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      {/* Shimmer placeholder until loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted skeleton-shimmer" />
      )}
    </div>
  );
});
