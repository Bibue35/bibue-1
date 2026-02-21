import { useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Reference callback for parallax or other DOM manipulation */
  imgRef?: React.Ref<HTMLImageElement>;
  style?: React.CSSProperties;
}

/**
 * Netflix/Crunchyroll-style blur-up image loading.
 * 
 * 1. Renders a dominant-color placeholder (via bg-muted) immediately
 * 2. Uses the small AniList thumbnail (~230px) as a blurred placeholder  
 * 3. Crossfades to the full-resolution image on load
 * 
 * Since AniList images are already WebP and we can't generate inline base64 at
 * build time for dynamic API images, we use a CSS color placeholder + the medium
 * variant as blur source (loads in <100ms on most connections).
 */
export const BlurImage = memo(function BlurImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  imgRef,
  style,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);

  // Derive a tiny placeholder URL from the full URL
  // AniList: replace /large/ or /extra_large/ with /small/ for ~80px placeholder
  const placeholderSrc = src
    .replace("/extra_large/", "/small/")
    .replace("/large/", "/small/");

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Blurred placeholder — tiny image stretched + blurred */}
      <img
        src={placeholderSrc}
        alt=""
        aria-hidden="true"
        width={10}
        height={15}
        decoding="async"
        className={cn(
          "absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-300",
          loaded ? "opacity-0" : "opacity-100",
          className
        )}
      />

      {/* Full resolution image — fades in on load */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "async" : "async"}
        sizes={sizes}
        onLoad={onLoad}
        className={cn(
          "relative w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={style}
      />
    </div>
  );
});
