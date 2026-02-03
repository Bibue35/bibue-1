import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, TrendingUp, Clock, Activity, Trophy, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Leaderboard } from "@/components/community/Leaderboard";
import { DiscussionCard } from "@/components/community/DiscussionCard";
import { CreateDiscussionDialog } from "@/components/community/CreateDiscussionDialog";
import { useAuth } from "@/contexts/AuthContext";

const CommunityPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discussions");
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

      // Fetch profiles separately
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
      <CollapsibleNavbar />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community</h1>
              <p className="text-muted-foreground">
                Discuss anime, manga, and connect with fellow fans
              </p>
            </div>
            <CreateDiscussionDialog />
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="liquid-glass-subtle p-1 rounded-full">
              <TabsTrigger 
                value="discussions" 
                className="rounded-full gap-2 data-[state=active]:bg-foreground/10"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Discussions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-full gap-2 data-[state=active]:bg-foreground/10"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="rounded-full gap-2 data-[state=active]:bg-foreground/10"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
            </TabsList>

            {/* Discussions Tab */}
            <TabsContent value="discussions">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Sort Options */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setSortBy("trending")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                        sortBy === "trending" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Trending
                    </button>
                    <button
                      onClick={() => setSortBy("recent")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                        sortBy === "recent" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Recent
                    </button>
                  </div>

                  {/* Discussions List */}
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="liquid-glass rounded-2xl p-6">
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
                    <div className="liquid-glass rounded-2xl p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to start a conversation!
                      </p>
                      <CreateDiscussionDialog />
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Community Stats
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discussions</span>
                        <span className="font-semibold">{discussions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Today</span>
                        <span className="font-semibold">-</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Preview */}
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </h3>
                    <ActivityFeed limit={5} showUser={true} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Community Activity Feed
                    </h3>
                    <ActivityFeed limit={30} showUser={true} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Top Contributors
                    </h3>
                    <Leaderboard limit={5} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" />
                      Community Leaderboard
                    </h3>
                    <Leaderboard limit={25} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="liquid-glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">How Karma Works</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">+5</span>
                        <span>Creating a discussion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">+2</span>
                        <span>Posting a reply</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">+1</span>
                        <span>Receiving a like</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">+10</span>
                        <span>Receiving helpful vote</span>
                      </li>
                    </ul>
                  </div>

                  {user && (
                    <div className="liquid-glass rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-4">Your Rank</h3>
                      <p className="text-muted-foreground text-sm">
                        Start contributing to climb the leaderboard!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
