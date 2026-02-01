/**
 * Bibue - Anime & Manga Platform
 * Main landing page with hero, seasonal anime, trending, and manga sections
 */
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { GenreSection } from "@/components/GenreSection";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { useTopAnime, useSeasonalAnime, useTopManga, useSchedule } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

const Index = () => {
  const { data: topAnime, isLoading: topAnimeLoading } = useTopAnime(1);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);
  const { data: scheduleAnime } = useSchedule();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Get recommended anime for hero section
  // If user is signed in, prioritize based on airing schedule
  // Otherwise, show trending seasonal anime
  const heroAnime = useMemo(() => {
    if (!seasonalAnime?.length) return [];
    
    // Get currently airing anime sorted by popularity/score
    const airingAnime = seasonalAnime
      .filter(anime => anime.status === "Currently Airing")
      .sort((a, b) => {
        // Sort by a combination of score and popularity
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        const popA = a.popularity || 999999;
        const popB = b.popularity || 999999;
        
        // Prioritize score, then popularity (lower is better)
        if (scoreB !== scoreA) return scoreB - scoreA;
        return popA - popB;
      });
    
    // If we have schedule data, try to include anime airing today
    if (scheduleAnime?.length) {
      const airingToday = scheduleAnime.filter(anime => 
        airingAnime.some(a => a.mal_id === anime.mal_id)
      );
      
      // Merge today's anime with top airing, removing duplicates
      const merged = [...airingToday];
      for (const anime of airingAnime) {
        if (!merged.some(a => a.mal_id === anime.mal_id)) {
          merged.push(anime);
        }
        if (merged.length >= 5) break;
      }
      return merged.slice(0, 5);
    }
    
    return airingAnime.slice(0, 5);
  }, [seasonalAnime, scheduleAnime, user]);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      
      {/* Hero Section */}
      <HeroSection
        featuredAnime={heroAnime.length > 0 ? heroAnime : seasonalAnime?.slice(0, 5)} 
        isLoading={seasonalLoading} 
      />

      {/* Coming Soon Banner */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="liquid-glass rounded-2xl p-4 sm:p-5 flex items-center justify-center gap-3 text-center">
            <Rocket className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm sm:text-base font-medium text-foreground/90">
              <Badge variant="secondary" className="mr-2">{t("banner.comingSoon")}</Badge>
              {t("banner.newFeatures")}
            </span>
            <Rocket className="w-5 h-5 text-primary animate-pulse hidden sm:block" />
          </div>
        </div>
      </section>

      {/* This Season */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("section.thisSeason")}</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">{t("section.thisSeasonJp")}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/anime?filter=seasonal">
                {t("section.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {seasonalLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              seasonalAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
        </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit - After This Season */}
      <div className="container mx-auto px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-8" />
      </div>

      {/* Anime Genres */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <GenreSection type="anime" />
        </div>
      </section>

      {/* Trending */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("section.trending")}</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">{t("section.trendingJp")}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/rankings?type=anime">
                {t("section.rankings")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {topAnimeLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              topAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
        </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit - After Trending */}
      <div className="container mx-auto px-4">
        <AdUnit slot="2345678901" format="horizontal" className="my-8" />
      </div>

      {/* Popular Manga */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("section.popularManga")}</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">{t("section.popularMangaJp")}</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/manga?filter=bypopularity">
                {t("section.explore")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {topMangaLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              topManga?.slice(0, 12).map((manga, index) => (
                <div key={manga.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
        </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit - After Popular Manga */}
      <div className="container mx-auto px-4">
        <AdUnit slot="3456789012" format="horizontal" className="my-8" />
      </div>

      {/* Manga Genres */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <GenreSection type="manga" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="relative liquid-glass rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                {t("cta.trackJourney")}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
                {t("cta.connectDescription")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="primary">
                  {t("cta.connectAccount")}
                </Button>
                <Button variant="outline" size="lg">
                  {t("cta.learnMore")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
