import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFollow, useFollowList } from "@/hooks/useFollow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
}

export function FollowersTab({ userId }: Props) {
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const { followersCount, followingCount } = useFollow(userId);
  const { data: list = [], isLoading } = useFollowList(userId, tab);

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30 w-fit">
        {([
          { id: "followers" as const, label: "Followers", count: followersCount },
          { id: "following" as const, label: "Following", count: followingCount },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "followers" ? "No followers yet" : "Not following anyone yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((profile: any) => (
            <Link
              key={profile.user_id}
              to={`/user/${profile.username || profile.user_id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(profile.display_name || profile.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.display_name || profile.username || "User"}
                </p>
                {profile.bio && (
                  <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
