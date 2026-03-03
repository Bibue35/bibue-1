import { useState, useEffect, useMemo, useRef } from "react";
import { Star, BookOpen, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopManga } from "@/hooks/useAnimeData";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { MangaCard } from "@/components/MangaCard";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatScore, type Manga } from "@/lib/api";
import { HeroSkeleton } from "@/components/skeletons";
import { useIsMobile } from "@/hooks/use-mobile";

const TYPE_STYLES = {
  manga: { label: "Manga", bg: "bg-red-500/80" },
  manhwa: { label: "Manhwa", bg: "bg-blue-500/80" },
  manhua: { label: "Manhua", bg: "bg-amber-500/80" },
} as const;

type ContentType = keyof typeof TYPE_STYLES;

interface HeroItem {
  manga: Manga;
  type: ContentType;
  viewsToday: number;
}

// Stable mock views seeded by ID
function mockViews(id: number): number {
  const seed = ((id * 2654435761) >>> 0) % 100000;
  return 5000 + seed;
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

export function CinematicHero() {
  const { data: mangaData, isLoading: ml } = useTopManga(1, undefined, "popularity");
  // Manhwa/manhua are NOT fetched here — they come from Index.tsx via deferred sections.
  // Hero renders with manga-only data; no duplicate network requests.
  const isMobile = useIsMobile();
  const [idx, setIdx] = useState(0);
  // Only block on the primary manga data — manhwa/manhua enhance progressively
  const isLoading = ml;

  // Build rotation + trending — render as soon as mangaData loads; manhwa/manhua enhance progressively
  const { rotation, trending } = useMemo(() => {
    if (!mangaData?.length)
      return { rotation: [] as HeroItem[], trending: [] as HeroItem[] };

    const tag = (list: Manga[], type: ContentType): HeroItem[] =>
      list.map((m) => ({ manga: m, type, viewsToday: mockViews(m.anilist_id) }));

    const ma = tag(mangaData, "manga");

    // Rotation: top manga only (no extra API calls)
    const rot: HeroItem[] = ma.slice(0, 8);

    // Trending carousel: next batch
    const trend = ma.slice(8, 18);

    return { rotation: rot, trending: trend };
  }, [mangaData]);

  // Auto-cycle 8s
  useEffect(() => {
    if (!rotation.length) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % rotation.length), 8000);
    return () => clearInterval(t);
  }, [rotation.length]);

  // Preload only the next slide image (current is already loading)
  const preloadRef = useRef<HTMLLinkElement | null>(null);
  useEffect(() => {
    preloadRef.current?.remove();
    preloadRef.current = null;
    if (!rotation.length) return;
    const nextIdx = (idx + 1) % rotation.length;
    const url = isMobile
      ? rotation[nextIdx]?.manga.images.webp.image_url
      : rotation[nextIdx]?.manga.images.webp.large_image_url;
    if (!url || document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
    preloadRef.current = link;
    return () => { preloadRef.current?.remove(); preloadRef.current = null; };
  }, [idx, rotation, isMobile]);

  if (isLoading || !rotation.length) return <HeroSkeleton variant="full" />;

  const current = rotation[idx];
  const ts = TYPE_STYLES[current.type];
  // Pick one of each type for sidebar (different from current)
  const sidebar = (() => {
    const remaining = rotation.filter((_, i) => i !== idx);
    const picks: HeroItem[] = [];
    const usedTypes = new Set<ContentType>();
    for (const item of remaining) {
      if (!usedTypes.has(item.type)) {
        picks.push(item);
        usedTypes.add(item.type);
      }
      if (picks.length === 3) break;
    }
    return picks;
  })();

  return (
    <section aria-label="Featured manga" className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] flex flex-col overflow-x-hidden">
      {/* Background crossfade — only render nearby slides to avoid downloading all images */}
      <div className="absolute inset-0 z-0">
        {rotation.map((item, i) => {
          // Only mount current, previous, and next slides to limit image downloads
          const len = rotation.length;
          const prev = (idx - 1 + len) % len;
          const next = (idx + 1) % len;
          const shouldMount = i === idx || i === prev || i === next;
          if (!shouldMount) return null;
          const isCurrent = i === idx;
          return (
            <img
              key={item.manga.anilist_id}
              src={isMobile ? item.manga.images.webp.image_url : item.manga.images.webp.large_image_url}
              alt=""
              aria-hidden="true"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                isCurrent ? "opacity-100" : "opacity-0"
              )}
              loading={isCurrent ? "eager" : "lazy"}
              decoding={isCurrent ? "sync" : "async"}
              fetchPriority={isCurrent ? "high" : "low"}
              sizes="100vw"
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-background/50" />
        <div className="absolute inset-0 bg-background/15" />
      </div>

      {/* Visually-hidden h1 for SEO */}
      <h1 className="sr-only">Discover Peak Manga, Manhwa & Manhua on Bibue</h1>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center gap-8">
            {/* Left */}
            <div className="flex-1 max-w-2xl">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white", ts.bg)}>
                  {ts.label}
                </span>
                {current.manga.score && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-foreground/10 backdrop-blur-sm border border-border/30 text-xs font-medium">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {formatScore(current.manga.score)}
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {formatViews(current.viewsToday)} today
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sacred tracking-tight leading-[1.05] mb-3 sm:mb-4">
                {current.manga.title}
              </h2>

              {/* Genre pills */}
              {current.manga.genres && current.manga.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                  {current.manga.genres.slice(0, 4).map((g) => (
                    <span
                      key={g.mal_id}
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-foreground/10 backdrop-blur-sm border border-border/20 text-[11px] sm:text-xs font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {current.manga.synopsis && (
                <p className="hidden xs:block text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                  {stripHtml(current.manga.synopsis)}
                </p>
              )}

              {/* CTA */}
              <Link to={`/manga/${current.manga.anilist_id}`}>
                <Button
                  size="lg"
                  className="gap-2 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Reading
                </Button>
              </Link>
            </div>

            {!isMobile && (
              <div className="hidden lg:flex flex-col gap-3 items-end shrink-0 ml-auto">
                {sidebar.map((item, si) => {
                  const ri = rotation.findIndex((r) => r.manga.anilist_id === item.manga.anilist_id);
                  return (
                    <button
                      key={item.manga.anilist_id}
                      onClick={() => setIdx(ri)}
                      className={cn(
                        "aspect-[2/3] rounded-xl overflow-hidden border transition-all duration-200 group relative",
                        "hover:scale-105 hover:border-primary/50 border-border/30",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        si === 0 || si === 2 ? "w-24 xl:w-28" : "w-28 xl:w-32"
                      )}
                      style={{
                        transform: si === 0 || si === 2 ? "translateX(-1.5rem)" : undefined,
                      }}
                    >
                      <img
                        src={item.manga.images.webp.image_url}
                        alt={item.manga.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[9px] font-medium truncate w-full">{item.manga.title}</span>
                      </div>
                      <div className="absolute top-1 left-1">
                        <span className={cn("px-1 py-0.5 rounded text-[8px] font-bold text-white", TYPE_STYLES[item.type].bg)}>
                          {TYPE_STYLES[item.type].label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom section: progress + trending */}
      <div className="relative z-10 pb-6 sm:pb-10 mt-auto pt-8 sm:pt-12">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-4 sm:mb-6">
            {rotation.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === idx ? "w-6 sm:w-8 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Trending Now */}
          {trending.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base font-semibold">Trending Now</span>
              </div>
              <HorizontalScroll showArrows={false}>
                {trending.slice(0, 12).map((item, index) => (
                  <div
                    key={item.manga.anilist_id}
                    className="flex-shrink-0 w-28 sm:w-36 md:w-44"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <MangaCard manga={item.manga} index={index} />
                  </div>
                ))}
              </HorizontalScroll>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
