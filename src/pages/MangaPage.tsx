import { useState, useEffect, useRef, useCallback } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams, Link } from "react-router-dom";
import {
  Loader2, SlidersHorizontal, ChevronDown, X, Bookmark, Sparkles,
  Search, Tag,
} from "lucide-react";
import { SectionError } from "@/components/SectionError";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useInfiniteTopManga, useInfiniteMangaByGenre, useInfiniteSearchManga } from "@/hooks/useAnimeData";
import { useHybridMangaByGenre } from "@/hooks/useHybridMangaData";
import { isNicheTagGenre } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type SortOption = "popularity" | "score" | "newest";

const BROWSE_GENRES = [
  { id: "1", name: "Action", emoji: "⚔️" },
  { id: "22", name: "Romance", emoji: "💕" },
  { id: "10", name: "Fantasy", emoji: "🧙" },
  { id: "8", name: "Drama", emoji: "🎭" },
  { id: "4", name: "Comedy", emoji: "😂" },
  { id: "14", name: "Horror", emoji: "👻" },
  { id: "101", name: "Thriller", emoji: "🔪" },
  { id: "7", name: "Mystery", emoji: "🔍" },
  { id: "36", name: "Slice of Life", emoji: "☕" },
  { id: "41", name: "Isekai", emoji: "🌀" },
  { id: "27", name: "Shounen", emoji: "💪" },
  { id: "25", name: "Shoujo", emoji: "🌸" },
  { id: "28", name: "Seinen", emoji: "📖" },
  { id: "42", name: "Josei", emoji: "💎" },
  { id: "13", name: "Historical", emoji: "🏯" },
  { id: "40", name: "Psychological", emoji: "🧠" },
  { id: "37", name: "Supernatural", emoji: "✨" },
  { id: "30", name: "Sports", emoji: "🏆" },
  { id: "24", name: "Sci-Fi", emoji: "🚀" },
  { id: "2", name: "Adventure", emoji: "🗺️" },
  { id: "tag-xianxia", name: "Xianxia", emoji: "🐉" },
  { id: "tag-wuxia", name: "Wuxia", emoji: "🥋" },
  { id: "tag-cultivation", name: "Cultivation", emoji: "🧘" },
  { id: "tag-martial-arts", name: "Martial Arts", emoji: "👊" },
  { id: "tag-reincarnation", name: "Reincarnation", emoji: "🔄" },
  { id: "tag-villainess", name: "Villainess", emoji: "👑" },
  { id: "tag-regression", name: "Regression", emoji: "⏪" },
  { id: "tag-dungeon", name: "Dungeon", emoji: "🏰" },
  { id: "tag-system", name: "System", emoji: "📊" },
];

const GENRE_ID_TO_NAME: Record<string, string> = {};
BROWSE_GENRES.forEach((g) => { GENRE_ID_TO_NAME[g.id] = g.name; });

const FORMAT_TABS = [
  { value: "all" as const, label: "All" },
  { value: "manga" as const, label: "Manga" },
  { value: "manhwa" as const, label: "Manhwa" },
  { value: "manhua" as const, label: "Manhua" },
];

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");
  const filterParam = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
  const sortParam = searchParams.get("sort") as SortOption | null;

  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "manhwa" | "manhua">(filterParam || "all");
  const [sortBy, setSortBy] = useState<SortOption>(sortParam || "popularity");
  const [showGenres, setShowGenres] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isUserAction = useRef(false);

  const debouncedSearch = useDebounce(localSearch.trim());
  const isSearching = debouncedSearch.length > 0;

  // Sync state from URL
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as typeof typeFilter | null;
    const urlSort = searchParams.get("sort") as SortOption | null;
    const urlQ = searchParams.get("q") || "";
    setTypeFilter(urlFilter || "all");
    setSortBy(urlSort || "popularity");
    setLocalSearch(urlQ);
  }, [searchParams]);

  // Sync URL from state
  useEffect(() => {
    if (!isUserAction.current && !localSearch) return;
    isUserAction.current = false;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (typeFilter !== "all") params.set("filter", typeFilter);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, typeFilter, sortBy, genreId, setSearchParams]);

  const handleTypeFilter = (f: typeof typeFilter) => { isUserAction.current = true; setTypeFilter(f); };
  const handleGenreSelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) { params.set("genre", id); } else { params.delete("genre"); }
    if (typeFilter !== "all") params.set("filter", typeFilter);
    setSearchParams(params, { replace: true });
    setShowGenres(false);
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["infiniteTopManga"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteMangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["hybridMangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteSearchManga"] });
  }, [queryClient]);

  const sortToAniList = (s: SortOption) => {
    if (s === "score") return "SCORE_DESC" as const;
    if (s === "newest") return "TRENDING_DESC" as const;
    return "POPULARITY_DESC" as const;
  };
  const genreName = genreId ? GENRE_ID_TO_NAME[genreId] || genreId : "";
  const isNicheGenre = !!genreName && isNicheTagGenre(genreName);

  const infiniteTop = useInfiniteTopManga(typeFilter === "all" ? undefined : typeFilter, sortBy);
  const infiniteGenre = useInfiniteMangaByGenre(genreName, typeFilter === "all" ? undefined : typeFilter, sortToAniList(sortBy));
  const hybridGenre = useHybridMangaByGenre(isNicheGenre ? genreName : "", typeFilter === "all" ? undefined : typeFilter, sortToAniList(sortBy));
  const infiniteSearch = useInfiniteSearchManga(debouncedSearch, isSearching, typeFilter === "all" ? undefined : typeFilter);

  const activeInfinite = isSearching ? infiniteSearch : genreId ? (isNicheGenre ? hybridGenre : infiniteGenre) : infiniteTop;
  const allItems = activeInfinite.data?.pages.flat() ?? [];
  const gridLoading = activeInfinite.isLoading;
  const isFetchingNext = activeInfinite.isFetchingNextPage;
  const hasNextPage = activeInfinite.hasNextPage;

  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({ threshold: 0, rootMargin: "400px 0px" });
  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNext) activeInfinite.fetchNextPage();
  }, [loadMoreInView, hasNextPage, isFetchingNext, activeInfinite]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <SEO
        title="Browse Manga"
        description="Discover top manga, manhwa, and manhua. Browse by genre, popularity, and ratings on Bibue."
        url="/manga"
        jsonLd={itemListJsonLd("Browse Manga", "/manga")}
      />
      <CollapsibleNavbar />

      {/* ── Header & Filters ── */}
      <section className="pt-24 sm:pt-28 pb-2">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mb-4">
            <SearchDropdown
              type="manga"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search any manga… (One Piece, Jujutsu Kaisen, genre, author...)"
              size="large"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1">
            {genreId ? genreName : isSearching ? `Results for "${debouncedSearch}"` : "Browse Manga"}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {genreId
              ? `Top ${typeFilter !== "all" ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + " " : ""}${genreName} series`
              : "Your discovery hub for manga, manhwa & manhua."
            }
          </p>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {FORMAT_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTypeFilter(tab.value)}
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

            <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

            {/* Sort dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sortBy === "popularity" ? "Trending" : sortBy === "score" ? "Top Rated" : "Newest"}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2" align="start">
                {(["popularity", "score", "newest"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { isUserAction.current = true; setSortBy(s); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      sortBy === s ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                  >
                    {s === "popularity" ? "Trending" : s === "score" ? "Top Rated" : "Newest"}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Genre toggle */}
            <button
              onClick={() => setShowGenres(!showGenres)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                showGenres || genreId ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Tag className="w-3.5 h-3.5" /> Genres
              <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", showGenres && "rotate-180")} />
            </button>

            <div className="flex-1" />

            {user && (
              <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-xs" asChild>
                <Link to="/recommendations"><Sparkles className="w-3.5 h-3.5" /> For You</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-xs" asChild>
              <Link to="/watchlist?type=manga"><Bookmark className="w-3.5 h-3.5" /> Saved</Link>
            </Button>
          </div>

          {/* Genre pills row */}
          {showGenres && (
            <div className="flex flex-wrap gap-1.5 mt-3 pb-2">
              {genreId && (
                <button
                  onClick={() => handleGenreSelect(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              {BROWSE_GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGenreSelect(genreId === g.id ? null : g.id)}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95",
                    genreId === g.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{g.emoji}</span> {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Active filter chips */}
          {(typeFilter !== "all" || sortBy !== "popularity" || genreId) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-muted-foreground">Active:</span>
              {typeFilter !== "all" && (
                <button onClick={() => { isUserAction.current = true; setTypeFilter("all"); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} <span className="opacity-60">×</span>
                </button>
              )}
              {sortBy !== "popularity" && (
                <button onClick={() => { isUserAction.current = true; setSortBy("popularity"); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {sortBy === "score" ? "Top Rated" : "Newest"} <span className="opacity-60">×</span>
                </button>
              )}
              {genreId && (
                <button onClick={() => handleGenreSelect(null)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {genreName} <span className="opacity-60">×</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Dense Grid ── */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          {isSearching && gridLoading ? (
            <div className="grid place-items-center rounded-2xl min-h-[320px]">
              <div className="flex flex-col items-center text-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching for "{debouncedSearch}"</p>
              </div>
            </div>
          ) : isSearching && !gridLoading && allItems.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/50 py-16">
              <div className="flex flex-col items-center text-center gap-3 px-6">
                <Search className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-base font-medium">No matches for "{debouncedSearch}"</p>
                <p className="text-sm text-muted-foreground">Try broadening your search or adjusting filters.</p>
                <Button variant="outline" onClick={() => setLocalSearch("")} className="rounded-full mt-2">
                  Clear Search
                </Button>
              </div>
            </div>
          ) : gridLoading ? (
            <div className="grid gap-2.5 sm:gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-2.5 sm:gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {allItems.map((manga, index) => (
                  <MangaCard key={`${manga.anilist_id}-${index}`} manga={manga} index={index} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNext && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                {!hasNextPage && allItems.length > 0 && (
                  <p className="text-sm text-muted-foreground">{t("common.noMoreResults") || "No more results"}</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Attribution */}
      <section className="pb-6">
        <div className="container mx-auto px-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center">
            Powered by <span className="font-medium text-muted-foreground/70">AniList</span> + <span className="font-medium text-muted-foreground/70">MangaDex</span> + <span className="font-medium text-muted-foreground/70">MyAnimeList</span>
          </p>
        </div>
      </section>

      <Footer />
    </PullToRefresh>
  );
}
