import { useState } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MessageCircle, Activity, Trophy, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Leaderboard } from "@/components/community/Leaderboard";
import { DiscussionCard } from "@/components/community/DiscussionCard";
import { CreateDiscussionDialog } from "@/components/community/CreateDiscussionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "discussions", label: "Discussions" },
  { key: "activity", label: "Activity" },
  { key: "leaderboard", label: "Leaderboard" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const CommunityPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("discussions");
  const [sortBy, setSortBy] = useState<"trending" | "recent">("trending");

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions", sortBy],
    queryFn: async () => {
      const { data: rawData, error } = await supabase
        .from("discussions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      if (!rawData || rawData.length === 0) return [];

      const userIds = [...new Set(rawData.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return rawData.map(d => ({
        ...d,
        profiles: profileMap.get(d.user_id) || null,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Community" description="Join the Bibue community. Discuss anime and manga, share opinions, and connect with fans." url="/community" />
      <CollapsibleNavbar />
      
      <main className="pt-28 sm:pt-32 pb-8 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-sacred font-bold tracking-tight mb-2 sm:mb-3">
                {t("community.title")}
              </h1>
              {language === "ja" && <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-1">{t("community.titleJp")}</p>}
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("community.subtitle")}
              </p>
            </div>
            <CreateDiscussionDialog />
          </div>

          {/* Tab pills — text-only, no icons */}
          <div className="flex items-center gap-1 mb-8 sm:mb-10">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 btn-press",
                  activeTab === tab.key
                    ? "filter-pill-active"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Discussions Tab */}
          {activeTab === "discussions" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {/* Sort pills */}
                <div className="flex gap-1.5 mb-6">
                  <button
                    onClick={() => setSortBy("trending")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press",
                      sortBy === "trending"
                        ? "filter-pill-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {t("community.trending")}
                  </button>
                  <button
                    onClick={() => setSortBy("recent")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press",
                      sortBy === "recent"
                        ? "filter-pill-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {t("community.recent")}
                  </button>
                </div>

                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border/5">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))
                ) : discussions && discussions.length > 0 ? (
                  discussions.map((discussion) => (
                    <DiscussionCard key={discussion.id} discussion={discussion} />
                  ))
                ) : (
                  <div className="bg-card rounded-2xl p-12 text-center border border-border/5">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("community.noDiscussions")}</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {t("community.beFirst")}
                    </p>
                    <CreateDiscussionDialog />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4">
                    {t("community.stats")}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("community.discussions")}</span>
                      <span className="font-medium">{discussions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("community.activeToday")}</span>
                      <span className="font-medium">-</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4">
                    {t("community.recentActivity")}
                  </h3>
                  <ActivityFeed limit={5} showUser={true} />
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-6">
                    {t("community.activityFeed")}
                  </h3>
                  <ActivityFeed limit={30} showUser={true} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4">
                    {t("community.topContributors")}
                  </h3>
                  <Leaderboard limit={5} />
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-6">
                    {t("community.communityLeaderboard")}
                  </h3>
                  <Leaderboard limit={25} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border/5">
                  <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4">
                    {t("community.howKarma")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-medium">+5</span>
                      <span>{t("community.creating")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-medium">+2</span>
                      <span>{t("community.posting")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-medium">+1</span>
                      <span>{t("community.receivingLike")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-medium">+10</span>
                      <span>{t("community.receivingHelpful")}</span>
                    </li>
                  </ul>
                </div>

                {user && (
                  <div className="bg-card rounded-2xl p-6 border border-border/5">
                    <h3 className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4">
                      {t("community.yourRank")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("community.startContributing")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
