import { useState } from "react";
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
  Settings, Trophy, Tv, BookOpen, Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

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

  // Fetch watchlist stats
  const { data: watchlistStats } = useQuery({
    queryKey: ["user-watchlist-stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("watchlist")
        .select("media_type, status")
        .eq("user_id", userId);
      if (error) throw error;

      const anime = data?.filter((w) => w.media_type === "anime") || [];
      const manga = data?.filter((w) => w.media_type === "manga") || [];
      const completed = data?.filter((w) => w.status === "completed") || [];

      return {
        animeCount: anime.length,
        mangaCount: manga.length,
        completedCount: completed.length,
      };
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4">
            <ProfileSkeleton />
          </div>
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
            <Link to="/community">
              <Button>{t("profile.backToCommunity")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                  {(profile.username || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {profile.display_name || profile.username || "User"}
                  </h1>
                  {badges?.slice(0, 3).map((ub) => (
                    <UserBadge key={ub.id} badge={ub.badge} size="sm" />
                  ))}
                </div>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link to="/settings">
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      {t("profile.editProfile")}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <FollowButton userId={userId!} />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setMessageDialogOpen(true)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left column - Bio */}
            <div className="lg:col-span-2 space-y-4">
              {profile.bio && (
                <p className="text-foreground/80">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Follow stats */}
              <div className="flex gap-4">
                <button
                  onClick={() => openFollowersModal("followers")}
                  className="hover:underline"
                >
                  <span className="font-bold">{followersCount}</span>{" "}
                  <span className="text-muted-foreground">{t("profile.followers")}</span>
                </button>
                <button
                  onClick={() => openFollowersModal("following")}
                  className="hover:underline"
                >
                  <span className="font-bold">{followingCount}</span>{" "}
                  <span className="text-muted-foreground">{t("profile.following")}</span>
                </button>
              </div>
            </div>

            {/* Right column - Stats Card */}
            <div className="liquid-glass rounded-2xl p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                {t("profile.stats")}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <StatItem icon={Tv} label={t("stats.anime")} value={watchlistStats?.animeCount || 0} />
                <StatItem icon={BookOpen} label={t("stats.manga")} value={watchlistStats?.mangaCount || 0} />
                <StatItem icon={Star} label={t("status.completed")} value={watchlistStats?.completedCount || 0} />
                <StatItem icon={Trophy} label={t("profile.karma")} value={reputation?.karma || 0} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="liquid-glass-subtle p-1 rounded-full">
              <TabsTrigger value="activity" className="rounded-full">{t("profile.activity")}</TabsTrigger>
              <TabsTrigger value="badges" className="rounded-full">{t("profile.badges")}</TabsTrigger>
              <TabsTrigger value="lists" className="rounded-full">{t("profile.lists")}</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">{t("profile.recentActivity")}</h3>
                <ActivityFeed userId={userId} limit={20} showUser={false} />
              </div>
            </TabsContent>

            <TabsContent value="badges">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("profile.badges")} ({badges?.length || 0})
                </h3>
                {badges?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {badges.map((ub) => (
                      <UserBadge key={ub.id} badge={ub.badge} showLabel size="lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("profile.noBadges")}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="lists">
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">{t("profile.lists")}</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? (
                    <Link to="/watchlist" className="text-primary hover:underline">
                      {t("profile.viewWatchlist")}
                    </Link>
                  ) : (
                    t("profile.listsAppear")
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Followers Modal */}
        <FollowersModal
          open={followersModalOpen}
          onOpenChange={setFollowersModalOpen}
          userId={userId!}
          username={profile.username || "User"}
          defaultTab={followersModalTab}
        />

        {/* Send Message Dialog */}
        {!isOwnProfile && (
          <SendMessageDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            recipientId={userId!}
            recipientUsername={profile.username}
            recipientAvatar={profile.avatar_url}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
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
