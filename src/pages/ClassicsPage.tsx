import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, History, Bookmark, Sparkles, Loader2 } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SectionError } from "@/components/SectionError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeByDecade, useClassicAnime } from "@/hooks/useAnimeData";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type Decade = "all" | "70s" | "80s" | "90s" | "2000s" | "2010s";

const DECADES: { value: Decade; label: string; years: string }[] = [
  { value: "all", label: "All Classics", years: "1970-2009" },
  { value: "70s", label: "70s", years: "1970-1979" },
  { value: "80s", label: "80s", years: "1980-1989" },
  { value: "90s", label: "90s", years: "1990-1999" },
  { value: "2000s", label: "2000s", years: "2000-2009" },
  { value: "2010s", label: "2010s", years: "2010-2019" },
];

export default function ClassicsPage() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDecade = (searchParams.get("decade") as Decade) || "all";
  
  const [decade, setDecade] = useState<Decade>(initialDecade);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["classicAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["animeByDecade"] });
  }, [queryClient]);

  const handleDecadeChange = (newDecade: Decade) => {
    setDecade(newDecade);
    const params = new URLSearchParams();
    if (newDecade !== "all") params.set("decade", newDecade);
    setSearchParams(params, { replace: true });
  };

  // Fetch data based on selected decade
  const { data: classicAnime, isLoading: classicLoading, error: classicError, refetch: refetchClassic } = useClassicAnime(1);
  const { data: decade70s, isLoading: loading70s, error: error70s, refetch: refetch70s } = useAnimeByDecade("70s", 1);
  const { data: decade80s, isLoading: loading80s, error: error80s, refetch: refetch80s } = useAnimeByDecade("80s", 1);
  const { data: decade90s, isLoading: loading90s, error: error90s, refetch: refetch90s } = useAnimeByDecade("90s", 1);
  const { data: decade2000s, isLoading: loading2000s, error: error2000s, refetch: refetch2000s } = useAnimeByDecade("2000s", 1);
  const { data: decade2010s, isLoading: loading2010s, error: error2010s, refetch: refetch2010s } = useAnimeByDecade("2010s", 1);

  // Get display data based on selected decade
  const getDisplayData = () => {
    switch (decade) {
      case "70s": return { data: decade70s, loading: loading70s, error: error70s, refetch: refetch70s };
      case "80s": return { data: decade80s, loading: loading80s, error: error80s, refetch: refetch80s };
      case "90s": return { data: decade90s, loading: loading90s, error: error90s, refetch: refetch90s };
      case "2000s": return { data: decade2000s, loading: loading2000s, error: error2000s, refetch: refetch2000s };
      case "2010s": return { data: decade2010s, loading: loading2010s, error: error2010s, refetch: refetch2010s };
      default: return { data: classicAnime, loading: classicLoading, error: classicError, refetch: refetchClassic };
    }
  };

  const { data: displayAnime, loading: isLoading, error: displayError, refetch: displayRefetch } = getDisplayData();
  const selectedDecade = DECADES.find(d => d.value === decade);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <CollapsibleNavbar />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">{t("classics.collection")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              {t("classics.title")}
            </h1>
            {language === "ja" && (
              <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-2">{t("classics.titleJp")}</p>
            )}
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("classics.subtitle")}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/recommendations">
                  <Sparkles className="w-4 h-4" />
                  {t("classics.forYou")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/watchlist?type=anime">
                  <Bookmark className="w-4 h-4" />
                  {t("classics.saved")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Decade Filters */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("classics.era")}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {DECADES.map((d) => (
                  <Button
                    key={d.value}
                    variant={decade === d.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleDecadeChange(d.value)}
                    className={cn(
                      "rounded-full text-xs sm:text-sm",
                      decade !== d.value && "glass-button"
                    )}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filter Chip */}
      {decade !== "all" && (
        <section className="pb-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("classics.browsing")}</span>
              <button
                onClick={() => handleDecadeChange("all")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {selectedDecade?.label} ({selectedDecade?.years})
                <span className="text-primary/60">×</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Anime Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {selectedDecade?.label} Anime
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedDecade?.years} • {t("classics.sortedByScore")}
          </p>
          
          {displayError ? (
            <SectionError message="Failed to load classics" onRetry={() => displayRefetch()} />
          ) : isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-20 rounded-xl"} />
              ))}
            </div>
          ) : displayAnime && displayAnime.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {displayAnime.map((anime, index) => (
                viewMode === "grid" ? (
                  <AnimeCard key={anime.anilist_id} anime={anime} index={index} />
                ) : (
                  <AnimeCard key={anime.anilist_id} anime={anime} index={index} variant="compact" />
                )
              ))}
            </div>
          ) : (
            <div className="rounded-2xl liquid-glass-subtle py-12">
              <div className="flex flex-col items-center text-center gap-3 px-6">
                <History className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-base font-medium">{t("classics.noAnime")}</p>
                <p className="text-sm text-muted-foreground">{t("classics.tryDifferent")}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </PullToRefresh>
  );
}
