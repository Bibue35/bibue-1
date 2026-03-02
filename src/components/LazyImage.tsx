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

/**
 * Generate a tiny 1x1 SVG data URI as LQIP placeholder
 * Uses the muted color from the theme for a subtle look
 */
const LQIP_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23222' width='1' height='1'/%3E%3C/svg%3E";

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
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px 0px" }
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
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      {/* LQIP blur placeholder */}
      {!isLoaded && (
        <img
          src={LQIP_PLACEHOLDER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
});
