import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, TrendingUp, Clock, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("trending");

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
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
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-xs">
                          {discussion.category}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
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
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
