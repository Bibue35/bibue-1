import { useState } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopAnime } from "@/hooks/useAnimeData";
import { SectionError } from "@/components/SectionError";
import { Crown, Medal, Award, Star, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/api";

export default function TopPage() {
  const [filter, setFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useTopAnime(page, filter);

  const getRankIcon = (index: number) => {
    const rank = (page - 1) * 25 + index + 1;
    if (rank === 1) return <Crown className="w-5 h-5 text-primary" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="w-5 h-5 text-primary/70" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Top Rated Anime of All Time — Bibue"
        description="The definitive ranking of the highest-rated anime series and movies, voted by millions of fans worldwide."
        url="/top"
        jsonLd={itemListJsonLd("Top Rated Anime", "/top")}
      />
      <CollapsibleNavbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold font-sacred mb-2">Top Anime</h1>
            <p className="font-jp text-lg text-muted-foreground mb-1">トップアニメ</p>
            <p className="text-sm text-muted-foreground">The highest-rated anime of all time</p>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {([
              { value: undefined, label: "Top Rated" },
              { value: "bypopularity" as const, label: "Most Popular" },
              { value: "favorite" as const, label: "Most Favorited" },
              { value: "airing" as const, label: "Top Airing" },
              { value: "upcoming" as const, label: "Upcoming" },
            ]).map(opt => (
              <Button
                key={opt.label}
                variant={filter === opt.value ? "default" : "ghost"}
                size="sm"
                onClick={() => { setFilter(opt.value); setPage(1); }}
                className="rounded-full"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Rankings */}
          {error ? (
            <SectionError message="Failed to load rankings" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 25 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-2">
              {data?.map((anime, index) => {
                const rank = (page - 1) * 25 + index + 1;
                return (
                  <div key={anime.anilist_id} className="flex items-center gap-3 sm:gap-4 liquid-glass rounded-xl p-3 sm:p-4 hover:bg-accent/5 transition-colors group">
                    {/* Rank */}
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-base shrink-0",
                      rank <= 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {getRankIcon(index) || `#${rank}`}
                    </div>

                    {/* Cover */}
                    <img
                      src={anime.images?.webp?.large_image_url}
                      alt={anime.title}
                      className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">{anime.title}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {anime.score && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-foreground text-foreground" />
                            {formatScore(anime.score)}
                          </span>
                        )}
                        {anime.members && (
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />
                            {(anime.members / 1000).toFixed(0)}K
                          </span>
                        )}
                        {anime.episodes && <span>{anime.episodes} eps</span>}
                        {anime.year && <span>{anime.year}</span>}
                      </div>
                      {anime.genres && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {anime.genres.slice(0, 3).map(g => (
                            <span key={g.mal_id} className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">{g.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data && data.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
