/**
 * Bibue - Manga, Manhwa & Manhua Platform
 * Main landing page — dense discovery grid design
 */
import { SEO, websiteJsonLd } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { SectionError } from "@/components/SectionError";
import { MangaCard } from "@/components/MangaCard";
import { Footer } from "@/components/Footer";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SearchDropdown } from "@/components/SearchDropdown";
import { useInfiniteTopManga } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Loader2 } from "lucide-react";
import { ContinueReadingRow } from "@/components/ContinueRow";
import { BibuOriginalsSection } from "@/components/BibuOriginalsSection";
import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { CyclingText } from "@/components/CyclingText";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const FORMAT_TABS = [
  { value: "all" as const, label: "All" },
  { value: "manga" as const, label: "Manga" },
  { value: "manhwa" as const, label: "Manhwa" },
  { value: "manhua" as const, label: "Manhua" },
];

const GENRE_PILLS = [
  "Action", "Romance", "Fantasy", "Drama", "Comedy", "Horror", "Isekai",
  "Slice of Life", "Thriller", "Sci-Fi", "Mystery", "Psychological",
  "Adventure", "Supernatural", "Historical", "Sports", "Shounen", "Shoujo",
  "Seinen", "Josei", "Martial Arts", "Reincarnation", "Cultivation",
];

const Index = () => {
  const [heroSearch, setHeroSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "manhwa" | "manhua">("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  useNotificationGenerator();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const formatType = typeFilter === "all" ? undefined : typeFilter;
  const infiniteData = useInfiniteTopManga(formatType, "popularity");
  const allItems = infiniteData.data?.pages.flat() ?? [];
  const gridLoading = infiniteData.isLoading;
  const isFetchingNext = infiniteData.isFetchingNextPage;
  const hasNextPage = infiniteData.hasNextPage;

  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({ threshold: 0, rootMargin: "400px 0px" });
  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNext) infiniteData.fetchNextPage();
  }, [loadMoreInView, hasNextPage, isFetchingNext]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["infiniteTopManga"] });
  }, [queryClient]);

  const handleSearchChange = useCallback((value: string) => {
    setHeroSearch(value);
    if (value.trim().length > 0) {
      navigate(`/manga?q=${encodeURIComponent(value.trim())}`);
    }
  }, [navigate]);

  return (
    <>
      <SEO
        title={undefined}
        description="Discover your next favorite manga, manhwa & manhua with Bibue. Track your reading list, explore trending titles, and connect with the community."
        url="/"
        jsonLd={websiteJsonLd()}
      />
      <CollapsibleNavbar />
      <PullToRefresh onRefresh={handleRefresh}>
      <main id="main-content">

      {/* Hero — compact */}
      <section className="pt-24 sm:pt-28 pb-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3">
            Discover Peak{" "}
            <CyclingText
              words={["Stories", "Manga", "Manhwa", "Manhua"]}
              interval={2500}
              className="text-primary"
            />
          </h1>

          {/* Search */}
          <div className="max-w-xl mb-4">
            <SearchDropdown
              type="manga"
              value={heroSearch}
              onChange={handleSearchChange}
              placeholder="Search any manga, manhwa, manhua…"
              size="large"
            />
          </div>

          {/* Format filter + genre pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {FORMAT_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95",
                  typeFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre pills — horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mt-2">
            <div className="flex items-center gap-1.5 w-max">
              {GENRE_PILLS.map((genre) => (
                <Link
                  key={genre}
                  to={`/genres/${genre.toLowerCase().replace(/[\s]+/g, "-")}`}
                  className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-foreground/5 transition-colors whitespace-nowrap"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Banner */}
      {user && (
        <section className="container mx-auto px-3 sm:px-4 pb-4">
          <Link
            to="/studio"
            className="group flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Are you a creator?</p>
                <p className="text-xs text-muted-foreground">Upload your manga & earn up to 80% revenue</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </section>
      )}

      {/* Bibue Originals */}
      <BibuOriginalsSection />

      {/* Continue Reading */}
      <ContinueReadingRow />

      {/* ── Trending Grid ── */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            {typeFilter === "all" ? "Trending Right Now" : `Trending ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`}
          </h2>

          {gridLoading ? (
            <div className="grid gap-2.5 sm:gap-3 grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-2.5 sm:gap-3 grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {allItems.map((manga, index) => (
                  <MangaCard key={`${manga.anilist_id}-${index}`} manga={manga} index={index} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNext && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                {!hasNextPage && allItems.length > 0 && (
                  <p className="text-sm text-muted-foreground">No more results</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      </main>
      <Footer />
      </PullToRefresh>
    </>
  );
};

export default Index;
