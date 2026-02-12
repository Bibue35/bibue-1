import { useMemo } from "react";
import { BarChart3, Clock, Film, BookOpen, Trophy, TrendingUp, CheckCircle, Pause, XCircle, Eye } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function StatCard({ icon: Icon, label, value, sub, className }: { 
  icon: React.ElementType; label: string; value: string | number; sub?: string; className?: string 
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsPage() {
  const { user } = useAuth();
  const { watchlist, isLoading } = useWatchlist();
  const { t, language } = useLanguage();

  const stats = useMemo(() => {
    if (!watchlist?.length) return null;

    const anime = watchlist.filter(i => i.media_type === "anime");
    const manga = watchlist.filter(i => i.media_type === "manga");

    const totalEpisodes = anime.reduce((sum, i) => sum + (i.episodes_watched || 0), 0);
    const totalChapters = manga.reduce((sum, i) => sum + (i.chapters_read || 0), 0);
    
    // Estimate watch time: avg 24 min per episode
    const totalMinutes = totalEpisodes * 24;
    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalMinutes / 1440).toFixed(1);

    // Status breakdown
    const statusCounts = {
      watching: watchlist.filter(i => i.status === "watching").length,
      completed: watchlist.filter(i => i.status === "completed").length,
      on_hold: watchlist.filter(i => i.status === "on_hold").length,
      dropped: watchlist.filter(i => i.status === "dropped").length,
      plan_to_watch: watchlist.filter(i => i.status === "plan_to_watch").length,
    };

    // Score distribution
    const scored = watchlist.filter(i => i.score && i.score > 0);
    const avgScore = scored.length > 0 
      ? (scored.reduce((sum, i) => sum + (i.score || 0), 0) / scored.length).toFixed(1) 
      : "N/A";

    // Genre counting (from titles — approximation)
    const completionRate = anime.length > 0 
      ? Math.round((statusCounts.completed / watchlist.length) * 100) 
      : 0;

    return {
      totalAnime: anime.length,
      totalManga: manga.length,
      totalEpisodes,
      totalChapters,
      totalHours,
      totalDays,
      statusCounts,
      avgScore,
      completionRate,
      totalEntries: watchlist.length,
    };
  }, [watchlist]);

  const statusItems = [
    { key: "watching", label: t("status.watching"), icon: Eye, color: "text-blue-400" },
    { key: "completed", label: t("status.completed"), icon: CheckCircle, color: "text-green-400" },
    { key: "on_hold", label: t("status.onHold"), icon: Pause, color: "text-yellow-400" },
    { key: "dropped", label: t("status.dropped"), icon: XCircle, color: "text-red-400" },
    { key: "plan_to_watch", label: t("status.planToWatch"), icon: Clock, color: "text-muted-foreground" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("stats.signIn")}</h1>
          <p className="text-muted-foreground">{t("stats.signInDesc")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      <section className="pt-28 sm:pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 font-sacred">{t("stats.myStats")}</h1>
            {language === "ja" && <p className="font-jp text-lg text-muted-foreground">{t("stats.statsJp")}</p>}
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">{t("stats.loadingStats")}</div>
          ) : !stats ? (
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("stats.noData")}</h2>
              <p className="text-muted-foreground">{t("stats.noDataDesc")}</p>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard icon={Clock} label={t("stats.watchTime")} value={`${stats.totalHours}h`} sub={`${stats.totalDays} ${t("stats.days")}`} />
                <StatCard icon={Film} label={t("common.episodes")} value={stats.totalEpisodes} sub={`${stats.totalAnime} ${t("stats.anime")}`} />
                <StatCard icon={BookOpen} label={t("common.chapters")} value={stats.totalChapters} sub={`${stats.totalManga} ${t("stats.manga")}`} />
                <StatCard icon={Trophy} label={t("stats.avgScore")} value={stats.avgScore} sub={`${t("stats.from")} ${stats.totalEntries} ${t("stats.entries")}`} />
              </div>

              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t("stats.statusBreakdown")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusItems.map(({ key, label, icon: StatusIcon, color }) => {
                    const count = stats.statusCounts[key as keyof typeof stats.statusCounts];
                    const pct = stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn("flex items-center gap-2", color)}>
                            <StatusIcon className="w-4 h-4" />
                            {label}
                          </span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {t("stats.completionRate")}
                    </span>
                    <span className="text-2xl font-bold">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-3" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
