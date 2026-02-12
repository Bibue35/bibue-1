import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Play, BookOpen, Star, CheckCircle, Clock, XCircle, Plus, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  mal_id: number;
  media_type: string;
  title: string;
  image_url: string | null;
  details: Record<string, unknown>;
  created_at: string;
  username?: string | null;
  avatar_url?: string | null;
}

const activityIcons: Record<string, React.ReactNode> = {
  added: <Plus className="w-4 h-4 text-primary" />,
  completed: <CheckCircle className="w-4 h-4 text-primary" />,
  rated: <Star className="w-4 h-4 text-primary" />,
  watching: <Play className="w-4 h-4 text-primary" />,
  reading: <BookOpen className="w-4 h-4 text-primary" />,
  dropped: <XCircle className="w-4 h-4 text-destructive" />,
  on_hold: <Clock className="w-4 h-4 text-muted-foreground" />,
};

// Activity labels are now resolved via useLanguage in the component

interface ActivityFeedProps {
  limit?: number;
  showUser?: boolean;
  userId?: string;
}

export function ActivityFeed({ limit = 20, showUser = true, userId }: ActivityFeedProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const activityLabels: Record<string, string> = {
    added: t("activity.addedToList"),
    completed: t("activity.completed"),
    rated: t("activity.rated"),
    watching: t("activity.startedWatching"),
    reading: t("activity.startedReading"),
    dropped: t("activity.dropped"),
    on_hold: t("activity.putOnHold"),
  };

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-feed", limit, userId],
    queryFn: async () => {
      // Build query
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Filter by user if provided
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: logs, error } = await query;

      if (error) throw error;
      if (!logs || logs.length === 0) return [];

      // Fetch user profiles separately
      const userIds = [...new Set(logs.map(l => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return logs.map(log => ({
        ...log,
        details: (log.details as Record<string, unknown>) || {},
        username: profileMap.get(log.user_id)?.username,
        avatar_url: profileMap.get(log.user_id)?.avatar_url,
      })) as ActivityLog[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{t("activity.noRecent")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => navigate(`/${activity.media_type}/${activity.mal_id}`)}
        >
          {/* User Avatar or Activity Icon */}
          {showUser ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {activity.avatar_url ? (
                <img
                  src={activity.avatar_url}
                  alt={activity.username || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {activityIcons[activity.activity_type] || <Clock className="w-4 h-4" />}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              {showUser && (
                <span className="font-medium">
                  {activity.username || "Anonymous"}
                </span>
              )}
              <span className="text-muted-foreground">
                {activityLabels[activity.activity_type] || activity.activity_type}
              </span>
            </div>
            <p className="font-medium text-sm truncate">{activity.title}</p>
            {activity.details && Object.keys(activity.details).length > 0 && (
              <p className="text-xs text-muted-foreground">
                {activity.details.score && `★ ${activity.details.score}/10`}
                {activity.details.episode && ` • Episode ${activity.details.episode}`}
                {activity.details.chapter && ` • Chapter ${activity.details.chapter}`}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Thumbnail */}
          {activity.image_url && (
            <img
              src={activity.image_url}
              alt={activity.title}
              className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}
