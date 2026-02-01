import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, TrendingUp, Clock, Plus, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MarkdownContent } from "@/components/MarkdownContent";

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("trending");

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions", activeTab],
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
        .select("user_id, username, avatar_url")
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
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Discussion
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="liquid-glass-subtle p-1 rounded-full">
                  <TabsTrigger 
                    value="trending" 
                    className="rounded-full gap-2 data-[state=active]:bg-foreground/10"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recent" 
                    className="rounded-full gap-2 data-[state=active]:bg-foreground/10"
                  >
                    <Clock className="w-4 h-4" />
                    Recent
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Discussions List */}
              <div className="space-y-4">
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
                    <article 
                      key={discussion.id} 
                      className="liquid-glass rounded-2xl p-6 hover-lift cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                            {discussion.title}
                          </h3>
                          <MarkdownContent 
                            content={discussion.content.slice(0, 200) + (discussion.content.length > 200 ? "..." : "")} 
                            className="text-muted-foreground text-sm line-clamp-2 mb-3"
                          />
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-xs">
                              {discussion.category}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                            </span>
                            <span className="text-xs">
                              by {(discussion.profiles as any)?.username || "Anonymous"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="liquid-glass rounded-2xl p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to start a conversation!
                    </p>
                    <Button>Start a Discussion</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Activity Feed */}
            <div className="lg:col-span-1">
              <div className="liquid-glass rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h3>
                <ActivityFeed limit={10} showUser={true} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
