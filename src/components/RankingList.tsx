import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Crown, Medal, Star } from "lucide-react";
import { Anime, Manga, formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RankingListProps {
  items: (Anime | Manga)[];
  type: "anime" | "manga";
  title: string;
  titleJp?: string;
  limit?: number;
}

export function RankingList({ items, type, title, titleJp, limit = 10 }: RankingListProps) {
  const displayItems = items.slice(0, limit);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-primary" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Medal className="w-5 h-5 text-accent" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-primary/20 to-transparent border-primary/50";
      case 2:
        return "bg-gradient-to-r from-muted/20 to-transparent border-muted/50";
      case 3:
        return "bg-gradient-to-r from-accent/20 to-transparent border-accent/50";
      default:
        return "bg-card/50 border-border hover:border-primary/50";
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-anime flex items-center justify-center shadow-neon">
          <Trophy className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          {titleJp && (
            <p className="font-jp text-sm text-muted-foreground">{titleJp}</p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const rank = index + 1;
          return (
            <Link
              key={item.mal_id}
              to={`/${type}/${item.mal_id}`}
              className={cn(
                "group flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                getRankStyle(rank)
              )}
            >
              {/* Rank */}
              <div className="w-10 flex items-center justify-center">
                {getRankIcon(rank) || (
                  <span className="font-display text-lg font-bold text-muted-foreground">
                    {rank}
                  </span>
                )}
              </div>

              {/* Image */}
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.images.webp.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.score && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Star className="w-3 h-3 fill-current" />
                      {formatScore(item.score)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(item.members)} users
                  </span>
                </div>
              </div>

              {/* Trend indicator */}
              <div className="flex items-center gap-1 text-neon-green text-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* View all link */}
      <Link
        to={`/rankings?type=${type}`}
        className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl border border-border hover:border-primary/50 font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
      >
        View Full Rankings
        <TrendingUp className="w-4 h-4" />
      </Link>
    </div>
  );
}
