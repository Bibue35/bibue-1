import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowButton } from "@/components/community/FollowButton";
import { FollowersModal } from "@/components/community/FollowersModal";
import { UserBadge } from "@/components/community/UserBadge";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SendMessageDialog } from "@/components/messages/SendMessageDialog";
import { useFollow } from "@/hooks/useFollow";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useUserReputation } from "@/hooks/useUserReputation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MapPin, Link as LinkIcon, Calendar, MessageSquare, 
  Settings, Trophy, Tv, BookOpen, Star, Clock, Heart, List
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch full watchlist for stats and list tabs
  const { data: watchlist } = useQuery({
    queryKey: ["user-watchlist-full", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch user lists
  const { data: userLists } = useQuery({
    queryKey: ["user-lists-profile", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_lists")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("likes_count", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { followersCount, followingCount } = useFollow(userId);
  const { data: badges } = useUserBadges(userId);
  const { data: reputation } = useUserReputation(userId);

  const isOwnProfile = currentUser?.id === userId;

  const openFollowersModal = (tab: "followers" | "following") => {
    setFollowersModalTab(tab);
    setFollowersModalOpen(true);
  };

  // Compute stats
  const animeList = watchlist?.filter(w => w.media_type === "anime") || [];
  const mangaList = watchlist?.filter(w => w.media_type === "manga") || [];
  const completedAnime = animeList.filter(w => w.status === "completed");
  const totalEpisodes = animeList.reduce((sum, w) => sum + (w.episodes_watched || 0), 0);
  const totalChapters = mangaList.reduce((sum, w) => sum + (w.chapters_read || 0), 0);
  const ratedItems = watchlist?.filter(w => w.score && Number(w.score) > 0) || [];
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((sum, w) => sum + Number(w.score || 0), 0) / ratedItems.length).toFixed(1)
    : "—";
  const watchHours = Math.round(totalEpisodes * 24 / 60); // ~24min per episode

  // Filter lists
  const getFilteredList = (mediaType: string) => {
    const list = mediaType === "anime" ? animeList : mangaList;
    if (!statusFilter) return list;
    return list.filter(w => w.status === statusFilter);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4"><ProfileSkeleton /></div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">{t("profile.userNotFound")}</h1>
            <Link to="/community"><Button>{t("profile.backToCommunity")}</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={profile.display_name || profile.username || "User Profile"}
        description={profile.bio || `View ${profile.username || "user"}'s anime and manga profile on Bibue.`}
        url={`/user/${userId}`}
        image={profile.avatar_url || undefined}
      />
      <CollapsibleNavbar />
      
      <main className="pt-20 pb-16">
        {/* Banner */}
        <div 
          className="h-32 md:h-48 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                  {(profile.username || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {profile.display_name || profile.username || "User"}
                  </h1>
                  {badges?.slice(0, 3).map((ub) => (
                    <UserBadge key={ub.id} badge={ub.badge} size="sm" />
                  ))}
                </div>
                {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link to="/settings">
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />{t("profile.editProfile")}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <FollowButton userId={userId!} />
                    <Button variant="outline" size="icon" onClick={() => setMessageDialogOpen(true)}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-4">
              {profile.bio && <p className="text-foreground/80">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <LinkIcon className="w-4 h-4" />{profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => openFollowersModal("followers")} className="hover:underline">
                  <span className="font-bold">{followersCount}</span> <span className="text-muted-foreground">{t("profile.followers")}</span>
                </button>
                <button onClick={() => openFollowersModal("following")} className="hover:underline">
                  <span className="font-bold">{followingCount}</span> <span className="text-muted-foreground">{t("profile.following")}</span>
                </button>
              </div>
            </div>

            {/* Enhanced Stats Card */}
            <div className="liquid-glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" />{t("profile.stats")}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <StatItem icon={Tv} label="Anime" value={animeList.length} />
                <StatItem icon={BookOpen} label="Manga" value={mangaList.length} />
                <StatItem icon={Star} label="Completed" value={completedAnime.length} />
                <StatItem icon={Clock} label="Hours" value={watchHours} />
                <StatItem icon={Star} label="Avg Rating" value={avgRating} />
                <StatItem icon={Trophy} label="Karma" value={reputation?.karma || 0} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="liquid-glass-subtle p-1 rounded-full flex-wrap">
              <TabsTrigger value="activity" className="rounded-full">{t("profile.activity")}</TabsTrigger>
              <TabsTrigger value="anime" className="rounded-full gap-1"><Tv className="w-3.5 h-3.5" />Anime</TabsTrigger>
              <TabsTrigger value="manga" className="rounded-full gap-1"><BookOpen className="w-3.5 h-3.5" />Manga</TabsTrigger>
              <TabsTrigger value="lists" className="rounded-full gap-1"><List className="w-3.5 h-3.5" />Lists</TabsTrigger>
              <TabsTrigger value="badges" className="rounded-full">{t("profile.badges")}</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">{t("profile.recentActivity")}</h3>
                <ActivityFeed userId={userId} limit={20} showUser={false} />
              </div>
            </TabsContent>

            {/* Anime List Tab */}
            <TabsContent value="anime">
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Anime List ({animeList.length})</h3>
                </div>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {["all", "watching", "completed", "plan_to_watch", "on_hold", "dropped"].map(s => (
                    <Button
                      key={s}
                      variant={(s === "all" && !statusFilter) || statusFilter === s ? "default" : "ghost"}
                      size="sm"
                      className="rounded-full text-xs capitalize"
                      onClick={() => setStatusFilter(s === "all" ? null : s)}
                    >
                      {s.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
                <WatchlistGrid items={getFilteredList("anime")} />
              </div>
            </TabsContent>

            {/* Manga List Tab */}
            <TabsContent value="manga">
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Manga List ({mangaList.length})</h3>
                </div>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {["all", "watching", "completed", "plan_to_watch", "on_hold", "dropped"].map(s => (
                    <Button
                      key={s}
                      variant={(s === "all" && !statusFilter) || statusFilter === s ? "default" : "ghost"}
                      size="sm"
                      className="rounded-full text-xs capitalize"
                      onClick={() => setStatusFilter(s === "all" ? null : s)}
                    >
                      {s === "watching" ? "reading" : s.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
                <WatchlistGrid items={getFilteredList("manga")} isManga />
              </div>
            </TabsContent>

            {/* Lists Tab */}
            <TabsContent value="lists">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Lists ({userLists?.length || 0})</h3>
                {userLists?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userLists.map(list => (
                      <Link key={list.id} to={`/list/${list.id}`} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium truncate">{list.title}</h4>
                        {list.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{list.description}</p>}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Heart className="w-3 h-3" /> {list.likes_count}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {isOwnProfile ? (
                      <Link to="/lists" className="text-primary hover:underline">Create your first list</Link>
                    ) : "No public lists yet."}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="badges">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">{t("profile.badges")} ({badges?.length || 0})</h3>
                {badges?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {badges.map((ub) => <UserBadge key={ub.id} badge={ub.badge} showLabel size="lg" />)}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("profile.noBadges")}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <FollowersModal open={followersModalOpen} onOpenChange={setFollowersModalOpen} userId={userId!} username={profile.username || "User"} defaultTab={followersModalTab} />
        {!isOwnProfile && (
          <SendMessageDialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen} recipientId={userId!} recipientUsername={profile.username} recipientAvatar={profile.avatar_url} />
        )}
      </main>
      <Footer />
    </div>
  );
};

function WatchlistGrid({ items, isManga }: { items: any[]; isManga?: boolean }) {
  if (!items.length) return <p className="text-center text-muted-foreground py-8">No entries found.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.id} className="group">
          <div className="aspect-[2/3] rounded-lg overflow-hidden mb-1.5 relative">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
            )}
            {item.score && Number(item.score) > 0 && (
              <div className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-foreground text-foreground" /> {Number(item.score).toFixed(0)}
              </div>
            )}
          </div>
          <h4 className="text-xs font-medium truncate">{item.title}</h4>
          <p className="text-[10px] text-muted-foreground capitalize">
            {isManga ? `${item.chapters_read || 0} ch` : `${item.episodes_watched || 0} ep`} • {(item.status || "").replace(/_/g, " ")}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 -mt-16">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="space-y-2 pb-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default UserProfile;
