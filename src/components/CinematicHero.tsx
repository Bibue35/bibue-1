import { useState, useEffect, useMemo, useRef } from "react";
import { useTopManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatScore, type Manga } from "@/lib/api";
import { HeroSkeleton } from "@/components/skeletons";
import { useIsMobile } from "@/hooks/use-mobile";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

export function CinematicHero() {
  const { data: mangaData, isLoading } = useTopManga(1, undefined, "popularity");
  const isMobile = useIsMobile();
  const [idx, setIdx] = useState(0);

  const items = useMemo(() => {
    if (!mangaData?.length) return [];
    return mangaData.slice(0, 6);
  }, [mangaData]);

  // Auto-cycle 8s
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length]);

  // Preload next image
  const preloadRef = useRef<HTMLLinkElement | null>(null);
  useEffect(() => {
    preloadRef.current?.remove();
    preloadRef.current = null;
    if (!items.length) return;
    const nextIdx = (idx + 1) % items.length;
    const url = isMobile
      ? items[nextIdx]?.images.webp.image_url
      : items[nextIdx]?.images.webp.large_image_url;
    if (!url) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
    preloadRef.current = link;
    return () => { preloadRef.current?.remove(); preloadRef.current = null; };
  }, [idx, items, isMobile]);

  if (isLoading || !items.length) return <HeroSkeleton variant="full" />;

  const current = items[idx];

  return (
    <section aria-label="Featured manga" className="relative min-h-[90vh] sm:min-h-[92vh] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {items.map((item, i) => {
          const next = (idx + 1) % items.length;
          if (i !== idx && i !== next) return null;
          return (
            <img
              key={item.anilist_id}
              src={isMobile ? item.images.webp.image_url : item.images.webp.large_image_url}
              alt=""
              aria-hidden="true"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-[1.5s] ease-in-out",
                i === idx ? "opacity-100" : "opacity-0"
              )}
              loading={i === idx ? "eager" : "lazy"}
              decoding={i === idx ? "sync" : "async"}
              fetchPriority={i === idx ? "high" : "low"}
              sizes="100vw"
            />
          );
        })}
        {/* Heavy gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Visually-hidden h1 for SEO */}
      <h1 className="sr-only">Discover Peak Manga, Manhwa & Manhua on Bibue</h1>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-end pb-16 sm:pb-24 pt-32 sm:pt-40">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Overline */}
          <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 sm:mb-6 font-medium">
            Manga · Manhwa · Manhua
          </p>

          {/* Giant editorial title */}
          <div className="mb-6 sm:mb-8">
            <p className="font-editorial text-base sm:text-lg md:text-xl text-muted-foreground/80 mb-2">
              Discover
            </p>
            <h2 className="text-[clamp(2.5rem,8vw,7rem)] font-sacred font-bold leading-[0.92] tracking-tight max-w-4xl">
              {current.title}
            </h2>
          </div>

          {/* Synopsis */}
          {current.synopsis && (
            <p className="text-sm sm:text-base text-muted-foreground/70 leading-relaxed max-w-lg mb-6 sm:mb-8 line-clamp-2">
              {stripHtml(current.synopsis)}
            </p>
          )}

          {/* Metadata line */}
          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10 text-xs sm:text-sm text-muted-foreground">
            {current.score && (
              <span className="font-medium text-foreground">{formatScore(current.score)}</span>
            )}
            {current.genres?.slice(0, 3).map((g) => (
              <span key={g.mal_id}>{g.name}</span>
            ))}
            {current.status && <span>{current.status}</span>}
          </div>

          {/* CTA — text link, not button */}
          <Link
            to={`/manga/${current.anilist_id}`}
            className="group inline-flex items-center gap-3 text-sm sm:text-base font-medium tracking-wide uppercase text-foreground hover:text-primary transition-colors duration-300"
          >
            Start Reading
            <span className="inline-block w-8 h-px bg-foreground group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
          </Link>

          {/* Progress indicators */}
          <div className="flex items-center gap-2 mt-12 sm:mt-16">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "transition-all duration-500",
                  i === idx
                    ? "w-8 h-px bg-foreground"
                    : "w-3 h-px bg-foreground/20 hover:bg-foreground/50"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
            <span className="ml-3 text-[10px] text-muted-foreground tabular-nums">
              {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
