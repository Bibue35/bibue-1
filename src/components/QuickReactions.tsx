import { useState, useEffect, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "😭", label: "Emotional" },
  { emoji: "🧠", label: "Mind-blown" },
  { emoji: "😍", label: "Love" },
  { emoji: "😂", label: "Funny" },
  { emoji: "💤", label: "Slow" },
] as const;

interface ReactionCounts {
  [emoji: string]: number;
}

interface QuickReactionsProps {
  mediaId: number;
  mediaType: "anime" | "manga";
  compact?: boolean;
  className?: string;
}

export const QuickReactions = memo(function QuickReactions({ mediaId, mediaType, compact, className }: QuickReactionsProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch reaction counts
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("media_reactions")
        .select("reaction")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      if (data) {
        const c: ReactionCounts = {};
        data.forEach(r => { c[r.reaction] = (c[r.reaction] || 0) + 1; });
        setCounts(c);
      }
    };

    // Fetch user's reactions
    const fetchUserReactions = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("media_reactions")
        .select("reaction")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .eq("user_id", user.id);

      if (data) {
        setUserReactions(new Set(data.map(r => r.reaction)));
      }
    };

    fetchCounts();
    fetchUserReactions();
  }, [mediaId, mediaType, user]);

  const toggleReaction = useCallback(async (emoji: string) => {
    if (!user || loading) return;
    setLoading(emoji);

    const hasReacted = userReactions.has(emoji);

    // Optimistic update
    setUserReactions(prev => {
      const next = new Set(prev);
      if (hasReacted) next.delete(emoji); else next.add(emoji);
      return next;
    });
    setCounts(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + (hasReacted ? -1 : 1),
    }));

    try {
      if (hasReacted) {
        await supabase
          .from("media_reactions")
          .delete()
          .eq("media_id", mediaId)
          .eq("media_type", mediaType)
          .eq("user_id", user.id)
          .eq("reaction", emoji);
      } else {
        await supabase
          .from("media_reactions")
          .insert({ media_id: mediaId, media_type: mediaType, user_id: user.id, reaction: emoji });
      }
    } catch {
      // Revert
      setUserReactions(prev => {
        const next = new Set(prev);
        if (hasReacted) next.add(emoji); else next.delete(emoji);
        return next;
      });
      setCounts(prev => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + (hasReacted ? 1 : -1),
      }));
    } finally {
      setLoading(null);
    }
  }, [user, loading, userReactions, mediaId, mediaType]);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  // Compact: show only reactions with counts > 0
  if (compact) {
    const active = REACTIONS.filter(r => (counts[r.emoji] || 0) > 0);
    if (active.length === 0) return null;
    return (
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {active.slice(0, 3).map(r => (
          <span key={r.emoji} className="text-[10px] text-muted-foreground">
            {r.emoji} {formatCount(counts[r.emoji] || 0)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {REACTIONS.map(r => {
        const count = counts[r.emoji] || 0;
        const active = userReactions.has(r.emoji);
        return (
          <button
            key={r.emoji}
            onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); }}
            disabled={!user || loading === r.emoji}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95",
              active
                ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              !user && "opacity-50 cursor-not-allowed"
            )}
            title={r.label}
          >
            <span className="text-sm">{r.emoji}</span>
            {count > 0 && <span>{formatCount(count)}</span>}
          </button>
        );
      })}
    </div>
  );
});
