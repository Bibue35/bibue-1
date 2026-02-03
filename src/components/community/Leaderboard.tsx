import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/useUserReputation";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  limit?: number;
}

export function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const { data: leaders, isLoading } = useLeaderboard(limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!leaders?.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No leaderboard data yet. Be the first to earn karma!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {leaders.map((leader, index) => (
        <Link
          key={leader.user_id}
          to={`/user/${leader.user_id}`}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-foreground/5",
            index === 0 && "bg-yellow-500/10",
            index === 1 && "bg-slate-400/10",
            index === 2 && "bg-orange-500/10"
          )}
        >
          {/* Rank */}
          <div className="w-8 flex items-center justify-center">
            {index === 0 ? (
              <Trophy className="w-6 h-6 text-yellow-500" />
            ) : index === 1 ? (
              <Medal className="w-6 h-6 text-slate-400" />
            ) : index === 2 ? (
              <Award className="w-6 h-6 text-orange-500" />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">
                {index + 1}
              </span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={leader.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-sm">
              {(leader.profile?.username || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Name & Stats */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {leader.profile?.display_name || leader.profile?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {leader.posts_count} posts · {leader.comments_count} comments
            </p>
          </div>

          {/* Karma */}
          <div className="text-right">
            <p className="font-bold text-primary">{leader.karma.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">karma</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
