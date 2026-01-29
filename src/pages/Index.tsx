import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { GenreSection } from "@/components/GenreSection";
import { Footer } from "@/components/Footer";
import { useTopAnime, useSeasonalAnime, useTopManga } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: topAnime, isLoading: topAnimeLoading } = useTopAnime(1);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      
      {/* Hero Section */}
      <HeroSection 
        featuredAnime={seasonalAnime?.slice(0, 5)} 
        isLoading={seasonalLoading} 
      />

      {/* This Season */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">This Season</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">今季のアニメ</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/anime?filter=seasonal">
                View All <ArrowRight className="w-4 h-4" />
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
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Trending Now</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">トレンド</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/rankings?type=anime">
                Rankings <ArrowRight className="w-4 h-4" />
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

      {/* Popular Manga */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Popular Manga</h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">人気漫画</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/manga?filter=bypopularity">
                Explore <ArrowRight className="w-4 h-4" />
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
                Track Your Journey
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
                Connect your AniList or MyAnimeList account to sync your watchlist and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="primary">
                  Connect Account
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
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
