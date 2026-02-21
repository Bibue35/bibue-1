import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getScheduleByDay, ScheduleItem, formatScore } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WatchlistButton } from "@/components/WatchlistButton";
import { EpisodeCountdown } from "@/components/EpisodeCountdown";
import { cn } from "@/lib/utils";
import { Star, Clock, Bookmark } from "lucide-react";
const AnimeDetailModal = lazy(() => import("@/components/AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTodayIndex(): number {
  return new Date().getDay();
}

const SchedulePage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { getWatchlistItem } = useWatchlist();
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [modalAnimeId, setModalAnimeId] = useState<number | null>(null);

  // Fetch all 7 days for desktop, selected day for mobile
  const dayQueries = DAYS.map((day, i) =>
    useQuery({
      queryKey: ["schedule", day.toLowerCase(), language],
      queryFn: () => getScheduleByDay(day.toLowerCase(), language),
      staleTime: 1000 * 60 * 60,
      enabled: true,
    })
  );

  const getFilteredItems = (items: ScheduleItem[] | undefined) => {
    if (!items) return [];
    if (onlyWatchlist && user) {
      return items.filter((item) => getWatchlistItem(item.anilist_id, "anime"));
    }
    return items;
  };

  const DayColumn = ({ dayIndex, className }: { dayIndex: number; className?: string }) => {
    const query = dayQueries[dayIndex];
    const items = getFilteredItems(query.data);
    const isToday = dayIndex === getTodayIndex();

    return (
      <div className={cn("flex-1 min-w-0", className)}>
        <div className={cn(
          "text-sm font-semibold mb-3 px-1",
          isToday && "text-primary"
        )}>
          {DAYS[dayIndex]}
          {isToday && <span className="text-xs font-normal text-primary ml-1.5">Today</span>}
          {!query.isLoading && (
            <span className="text-xs font-normal text-muted-foreground ml-1.5">({items.length})</span>
          )}
        </div>

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">
            {onlyWatchlist ? "No watchlist shows airing" : "No episodes airing"}
          </p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => {
              const isOnWatchlist = user ? !!getWatchlistItem(item.anilist_id, "anime") : false;
              const now = Math.floor(Date.now() / 1000);
              const isUpcoming = item.airingAt > now;

              return (
                <button
                  key={`${item.anilist_id}-${item.episode}`}
                  onClick={() => setModalAnimeId(item.anilist_id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors group",
                    "hover:bg-foreground/5",
                    isOnWatchlist && "ring-1 ring-primary/20 bg-primary/5"
                  )}
                >
                  <img
                    src={item.anime.images.webp.image_url}
                    alt={`${item.anime.title} cover art`}
                    className="w-10 h-14 object-cover rounded bg-muted shrink-0"
                    loading="lazy"
                    width={40}
                    height={56}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium truncate group-hover:text-foreground/80 transition-colors">
                      {item.anime.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      {item.episode && <span>Ep {item.episode}</span>}
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.airingTime}
                      </span>
                      {item.anime.score && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                          {formatScore(item.anime.score)}
                        </span>
                      )}
                    </div>
                    {isUpcoming && item.episode && (
                      <div className="mt-1">
                        <EpisodeCountdown
                          airingAt={item.airingAt}
                          episode={item.episode}
                          compact
                        />
                      </div>
                    )}
                  </div>
                  {isOnWatchlist && (
                    <Bookmark className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO
        title="Anime Airing Schedule — This Week — Bibue"
        description="See what anime episodes air each day this week. Find airing times in your timezone and track your watchlist shows."
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Airing Schedule</h1>
            <p className="text-muted-foreground text-sm mt-1">Episodes airing this week</p>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <Switch
                id="watchlist-only"
                checked={onlyWatchlist}
                onCheckedChange={setOnlyWatchlist}
              />
              <Label htmlFor="watchlist-only" className="text-xs text-muted-foreground cursor-pointer">
                My watchlist only
              </Label>
            </div>
          )}
        </div>

        {/* Mobile: Tab selector */}
        <div className="md:hidden mb-4 overflow-x-auto">
          <div className="flex gap-1 bg-card rounded-full p-1 border border-border/50 w-fit">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  i === selectedDay
                    ? "bg-primary text-primary-foreground"
                    : i === getTodayIndex()
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {SHORT_DAYS[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Single day */}
        <div className="md:hidden">
          <DayColumn dayIndex={selectedDay} />
        </div>

        {/* Desktop: 7 columns */}
        <div className="hidden md:flex gap-3">
          {DAYS.map((_, i) => (
            <DayColumn key={i} dayIndex={i} />
          ))}
        </div>
      </main>
      <Footer />

      {modalAnimeId !== null && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={modalAnimeId}
            open={modalAnimeId !== null}
            onOpenChange={(open) => !open && setModalAnimeId(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default SchedulePage;
