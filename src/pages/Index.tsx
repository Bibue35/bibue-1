import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { RankingList } from "@/components/RankingList";
import { ScheduleSection } from "@/components/ScheduleSection";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useTopAnime, useSeasonalAnime, useTopManga } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Film, BookOpen, TrendingUp, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: topAnime, isLoading: topAnimeLoading } = useTopAnime(1);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticleBackground />
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection 
        featuredAnime={seasonalAnime?.slice(0, 5)} 
        isLoading={seasonalLoading} 
      />

      {/* Quick Stats */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Film, label: "Anime", value: "25,000+", color: "primary" },
              { icon: BookOpen, label: "Manga", value: "60,000+", color: "accent" },
              { icon: TrendingUp, label: "Rankings", value: "Live", color: "secondary" },
              { icon: Newspaper, label: "News", value: "Daily", color: "primary" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 text-center hover:shadow-neon transition-shadow animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}`} />
                <p className="font-display text-2xl md:text-3xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-muted-foreground font-display uppercase tracking-wider text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Anime */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="This Season" titleJp="今季のアニメ">
            {seasonalLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              seasonalAnime?.slice(0, 15).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-48">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Top Anime & Manga Rankings */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {topAnimeLoading ? (
              <Skeleton className="h-[600px] rounded-2xl" />
            ) : (
              <RankingList
                items={topAnime || []}
                type="anime"
                title="Top Anime"
                titleJp="人気アニメ"
              />
            )}
            {topMangaLoading ? (
              <Skeleton className="h-[600px] rounded-2xl" />
            ) : (
              <RankingList
                items={topManga || []}
                type="manga"
                title="Top Manga"
                titleJp="人気漫画"
              />
            )}
          </div>
        </div>
      </section>

      {/* Trending Anime */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Trending Now" titleJp="トレンド">
            {topAnimeLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              topAnime?.slice(0, 15).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-48">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Schedule Section */}
      <ScheduleSection />

      {/* Manga Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Popular Manga" titleJp="人気漫画">
            {topMangaLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              topManga?.slice(0, 15).map((manga, index) => (
                <div key={manga.mal_id} className="flex-shrink-0 w-48">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Manhwa Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Popular Manhwa" titleJp="人気韓国漫画">
            {manhwaLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              manhwa?.slice(0, 15).map((manga, index) => (
                <div key={manga.mal_id} className="flex-shrink-0 w-48">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative glass rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">Join the Community</span>
              </h2>
              <p className="font-jp text-xl text-muted-foreground mb-2">コミュニティに参加</p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Connect your AniList or MyAnimeList account to track your anime and manga,
                get personalized recommendations, and join discussions with millions of fans.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="xl" variant="glow">
                  Connect AniList
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="xl" variant="outline">
                  Connect MAL
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
