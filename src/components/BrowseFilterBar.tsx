import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Grid, List, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Genre / Collection data                                           */
/* ------------------------------------------------------------------ */

interface GenreItem {
  id: string;
  label: string;
}

interface CollectionItem {
  id: string;
  label: string;
  /** The URL search params this collection maps to */
  param: string;
  /** If it links to a separate page instead */
  href?: string;
}

const animeCollections: CollectionItem[] = [
  { id: "trending", label: "🔥 Trending", param: "filter=airing" },
  { id: "this-season", label: "📺 This Season", param: "filter=seasonal" },
  { id: "new-this-week", label: "🆕 New This Week", param: "filter=new" },
  { id: "completed", label: "✅ Completed", param: "filter=completed" },
  { id: "upcoming", label: "⏳ Coming Soon", param: "filter=upcoming" },
  { id: "popular", label: "⭐ Most Popular", param: "filter=bypopularity" },
  { id: "classics", label: "🏛️ Classics", param: "classics", href: "/classics" },
];

const mangaCollections: CollectionItem[] = [
  { id: "new-this-week", label: "🆕 New This Week", param: "collection=new" },
  { id: "completed", label: "✅ Completed", param: "collection=completed" },
];

const animeGenres: GenreItem[] = [
  { id: "1", label: "Action" },
  { id: "2", label: "Adventure" },
  { id: "4", label: "Comedy" },
  { id: "8", label: "Drama" },
  { id: "10", label: "Fantasy" },
  { id: "14", label: "Horror" },
  { id: "7", label: "Mystery" },
  { id: "22", label: "Romance" },
  { id: "24", label: "Sci-Fi" },
  { id: "36", label: "Slice of Life" },
  { id: "30", label: "Sports" },
  { id: "37", label: "Supernatural" },
  { id: "41", label: "Isekai" },
  { id: "18", label: "Mecha" },
  { id: "19", label: "Music" },
  { id: "40", label: "Psychological" },
  { id: "13", label: "Historical" },
  { id: "101", label: "Thriller" },
  { id: "73", label: "School" },
  { id: "38", label: "Military" },
];

const mangaGenres: GenreItem[] = [
  { id: "1", label: "Action" },
  { id: "2", label: "Adventure" },
  { id: "4", label: "Comedy" },
  { id: "8", label: "Drama" },
  { id: "10", label: "Fantasy" },
  { id: "14", label: "Horror" },
  { id: "22", label: "Romance" },
  { id: "36", label: "Slice of Life" },
  { id: "41", label: "Isekai" },
  { id: "7", label: "Mystery" },
  { id: "37", label: "Supernatural" },
  { id: "40", label: "Psychological" },
  { id: "25", label: "Shoujo" },
  { id: "27", label: "Shounen" },
  { id: "42", label: "Josei" },
  { id: "28", label: "Seinen" },
  { id: "13", label: "Historical" },
  { id: "101", label: "Thriller" },
  { id: "73", label: "School" },
];

/* ------------------------------------------------------------------ */
/*  Anime-specific config                                             */
/* ------------------------------------------------------------------ */

interface AnimeFilterConfig {
  type: "anime";
  filter?: string;
  sortBy: "popularity" | "score" | "trending";
  viewMode: "grid" | "list";
  onFilterChange: (f: string | undefined) => void;
  onSortChange: (s: "popularity" | "score" | "trending") => void;
  onViewModeChange: (v: "grid" | "list") => void;
}

interface MangaFilterConfig {
  type: "manga";
  typeFilter: "all" | "manga" | "manhwa" | "manhua";
  sortBy: "popularity" | "score" | "newest";
  viewMode: "grid" | "list";
  onTypeFilterChange: (f: "all" | "manga" | "manhwa" | "manhua") => void;
  onSortChange: (s: "popularity" | "score" | "newest") => void;
  onViewModeChange: (v: "grid" | "list") => void;
}

type BrowseFilterBarProps = (AnimeFilterConfig | MangaFilterConfig) & {
  className?: string;
  defaultOpen?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function BrowseFilterBar(props: BrowseFilterBarProps) {
  const { className, defaultOpen = false } = props;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchParams] = useSearchParams();

  const isAnime = props.type === "anime";
  const basePath = isAnime ? "/anime" : "/manga";
  const collections = isAnime ? animeCollections : mangaCollections;
  const genres = isAnime ? animeGenres : mangaGenres;

  const currentGenre = searchParams.get("genre");
  const currentFilter = searchParams.get("filter");
  const currentCollection = searchParams.get("collection");

  const isCollectionActive = (col: CollectionItem) => {
    if (col.href) return false;
    const params = new URLSearchParams(col.param);
    const colFilter = params.get("filter");
    const colCollection = params.get("collection");
    if (colCollection) return currentCollection === colCollection;
    return currentFilter === colFilter;
  };

  const getCollectionLink = (col: CollectionItem) => {
    if (col.href) return col.href;
    return `${basePath}?${col.param}`;
  };

  // Count active filters for badge
  const activeCount = [
    currentGenre,
    isAnime ? (props as AnimeFilterConfig).filter : null,
    isAnime ? ((props as AnimeFilterConfig).sortBy !== "popularity" ? "sort" : null) : ((props as MangaFilterConfig).sortBy !== "popularity" ? "sort" : null),
  ].filter(Boolean).length;

  return (
    <div className={cn("", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger — entire header is clickable */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors group">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Browse & Filter</span>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-5 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          {/* Collections row */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Access
              </span>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => {
                  const active = isCollectionActive(col);
                  return (
                    <Link
                      key={col.id}
                      to={getCollectionLink(col)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95",
                        active
                          ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {col.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genres grid */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Genres
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
              {genres.map((genre) => {
                const active = currentGenre === genre.id;
                return (
                  <Link
                    key={genre.id}
                    to={`${basePath}?genre=${genre.id}`}
                    className={cn(
                      "px-2.5 py-2 rounded-lg text-xs text-center font-medium transition-all duration-200 active:scale-95",
                      active
                        ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {genre.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Type filter moved to hero section for manga */}

          {/* Status filter (anime only) */}
          {isAnime && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </span>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: undefined, label: "All" },
                  { value: "airing", label: "Airing" },
                  { value: "upcoming", label: "Upcoming" },
                  { value: "completed", label: "Completed" },
                ] as const).map((f) => {
                  const config = props as AnimeFilterConfig;
                  const active = config.filter === f.value;
                  return (
                    <Button
                      key={f.label}
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      onClick={() => config.onFilterChange(f.value)}
                      className={cn(
                        "rounded-full text-xs h-8",
                        !active && "bg-muted/40"
                      )}
                    >
                      {f.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sort by
            </span>
            <div className="flex flex-wrap gap-2">
              {isAnime ? (
                [
                  { value: "popularity" as const, label: "Most Popular" },
                  { value: "score" as const, label: "Top Rated" },
                  { value: "trending" as const, label: "Trending" },
                ].map((sort) => {
                  const config = props as AnimeFilterConfig;
                  const active = config.sortBy === sort.value;
                  return (
                    <Button
                      key={sort.value}
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      onClick={() => config.onSortChange(sort.value)}
                      className={cn("rounded-full text-xs h-8", !active && "bg-muted/40")}
                    >
                      {sort.label}
                    </Button>
                  );
                })
              ) : (
                [
                  { value: "popularity" as const, label: "Popular" },
                  { value: "score" as const, label: "Top Rated" },
                  { value: "newest" as const, label: "Newest" },
                ].map((sort) => {
                  const config = props as MangaFilterConfig;
                  const active = config.sortBy === sort.value;
                  return (
                    <Button
                      key={sort.value}
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      onClick={() => config.onSortChange(sort.value)}
                      className={cn("rounded-full text-xs h-8", !active && "bg-muted/40")}
                    >
                      {sort.label}
                    </Button>
                  );
                })
              )}
            </div>
          </div>

          {/* View mode */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-xs text-muted-foreground">View mode:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={props.viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                onClick={() => (isAnime ? (props as AnimeFilterConfig) : (props as MangaFilterConfig)).onViewModeChange("grid")}
                className="rounded-full h-8 w-8"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={props.viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                onClick={() => (isAnime ? (props as AnimeFilterConfig) : (props as MangaFilterConfig)).onViewModeChange("list")}
                className="rounded-full h-8 w-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
