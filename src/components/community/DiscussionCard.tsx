import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { lazy, Suspense } from "react";
const MarkdownContent = lazy(() => import("@/components/MarkdownContent").then(m => ({ default: m.MarkdownContent })));
import { MessageCircle, ThumbsUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string | null;
      avatar_url: string | null;
      display_name?: string | null;
    } | null;
    _count?: {
      replies: number;
      likes: number;
    };
  };
}

const categoryColors: Record<string, string> = {
  general: "bg-foreground/8 text-foreground/80",
  anime: "bg-foreground/8 text-foreground/80",
  manga: "bg-foreground/8 text-foreground/80",
  recommendations: "bg-foreground/8 text-foreground/80",
  news: "bg-foreground/8 text-foreground/80",
  spoilers: "bg-destructive/10 text-destructive",
};

export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const profile = discussion.profiles;

  return (
    <article className="bg-card rounded-2xl p-6 border border-border/5 transition-all cursor-pointer group hover:border-border/15">
      <Link to={`/community/discussion/${discussion.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link 
            to={`/user/${discussion.user_id}`} 
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-sm">
                {(profile?.username || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {discussion.title}
            </h3>
            
            <Suspense fallback={<p className="text-muted-foreground text-sm line-clamp-2 mt-1">{discussion.content.slice(0, 200)}</p>}>
              <MarkdownContent 
                content={discussion.content.slice(0, 200) + (discussion.content.length > 200 ? "..." : "")} 
                className="text-muted-foreground text-sm line-clamp-2 mt-1"
              />
            </Suspense>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              <Badge 
                variant="secondary" 
                className={categoryColors[discussion.category] || categoryColors.general}
              >
                {discussion.category}
              </Badge>

              <Link 
                to={`/user/${discussion.user_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {profile?.display_name || profile?.username || "Anonymous"}
              </Link>

              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </span>

              {discussion._count && (
                <>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {discussion._count.replies}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {discussion._count.likes}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
