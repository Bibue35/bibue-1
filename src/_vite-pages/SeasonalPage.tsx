import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeasonalAnime, Anime, formatScore } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimeCard } from "@/components/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

const SEASONS = ["winter", "spring", "summer", "fall"] as const;
type Season = (typeof SEASONS)[number];

const SEASON_LABELS: Record<Season, string> = {
  winter: "Winter",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
  { value: "startDate", label: "Start Date" },
] as const;

const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller", "Mecha", "Music",
];

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "fall";
}

function parseSeasonParam(param?: string): { season: Season; year: number } {
  if (!param) return { season: getCurrentSeason(), year: new Date().getFullYear() };
  const match = param.match(/^(winter|spring|summer|fall)-(\d{4})$/);
  if (match) return { season: match[1] as Season, year: parseInt(match[2]) };
  return { season: getCurrentSeason(), year: new Date().getFullYear() };
}

const SeasonalPage = () => {
  const { seasonParam } = useParams<{ seasonParam?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { season, year } = parseSeasonParam(seasonParam);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [showFilters, setShowFilters] = useState(false);

  const { data: animeList, isLoading } = useQuery({
    queryKey: ["seasonal", season, year, language],
    queryFn: () => getSeasonalAnime(year, season, language),
    staleTime: 1000 * 60 * 60,
  });

  const filteredAnime = useMemo(() => {
    if (!animeList) return [];
    let filtered = [...animeList];

    if (selectedGenres.length > 0) {
      filtered = filtered.filter((a) =>
        selectedGenres.every((g) => a.genres?.some((ag) => ag.name === g))
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((a) => {
        if (selectedStatus === "Airing") return a.status === "RELEASING";
        if (selectedStatus === "Not Yet Aired") return a.status === "NOT_YET_RELEASED";
        if (selectedStatus === "Finished") return a.status === "FINISHED";
        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "rating") return (b.score || 0) - (a.score || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "startDate") return (a.aired?.from || "").localeCompare(b.aired?.from || "");
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return filtered;
  }, [animeList, selectedGenres, selectedDay, selectedStatus, sortBy]);

  const setSeasonYear = (s: Season, y: number) => {
    const now = new Date();
    if (s === getCurrentSeason() && y === now.getFullYear()) {
      navigate("/seasonal");
    } else {
      navigate(`/seasonal/${s}-${y}`);
    }
  };

  const seasonTitle = `${SEASON_LABELS[season]} ${year}`;
  const hasActiveFilters = selectedGenres.length > 0 || selectedStatus || selectedDay;

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO
        title={`${seasonTitle} Anime Season — Complete Guide — Bibue`}
        description={`Browse all anime airing in ${seasonTitle}. Find new series, filter by genre, and add to your watchlist.`}
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{seasonTitle} Anime</h1>
          {!isLoading && (
            <p className="text-muted-foreground text-sm">
              {filteredAnime.length} anime this season
            </p>
          )}
        </div>

        {/* Season/Year selector */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border/50">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setSeasonYear(s, year)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
                  s === season
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {SEASON_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSeasonYear(season, year - 1)}
              aria-label="Previous year"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">{year}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSeasonYear(season, year + 1)}
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn("rounded-full gap-1.5 ml-auto", hasActiveFilters && "border-primary text-primary")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                {(selectedGenres.length > 0 ? 1 : 0) + (selectedStatus ? 1 : 0) + (selectedDay ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-card rounded-xl border border-border/50 space-y-4">
            {/* Genre filter */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Genre</h3>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      setSelectedGenres((prev) =>
                        prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
                      )
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                      selectedGenres.includes(g)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Status</h3>
              <div className="flex flex-wrap gap-1.5">
                {["Airing", "Not Yet Aired", "Finished"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                      selectedStatus === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Sort By</h3>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                      sortBy === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => {
                  setSelectedGenres([]);
                  setSelectedStatus(null);
                  setSelectedDay(null);
                  setSortBy("popularity");
                }}
              >
                <X className="w-3 h-3" /> Clear all
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAnime.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No anime found matching your filters.</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => {
                  setSelectedGenres([]);
                  setSelectedStatus(null);
                  setSelectedDay(null);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredAnime.map((anime) => (
              <AnimeCard key={anime.anilist_id} anime={anime} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SeasonalPage;
