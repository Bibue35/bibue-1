import { Link } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Anime, Manga } from "@/lib/api";

interface SearchRecommendationsProps {
  type: "anime" | "manga";
  recommendations: Anime[] | Manga[] | undefined;
  isLoading: boolean;
  searchQuery: string;
  className?: string;
}

export function SearchRecommendations({
  type,
  recommendations,
  isLoading,
  searchQuery,
  className,
}: SearchRecommendationsProps) {
  if (!searchQuery || (!isLoading && (!recommendations || recommendations.length === 0))) {
    return null;
  }

  const getImageUrl = (item: Anime | Manga) => {
    return item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url;
  };

  const getDetailUrl = (item: Anime | Manga) => {
    return `/${type}/${item.mal_id}`;
  };

  return (
    <section className={cn("py-6", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Similar to your search</h3>
          <span className="text-sm text-muted-foreground font-jp">おすすめ</span>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32">
                <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recommendations?.slice(0, 10).map((item) => (
              <Link
                key={item.mal_id}
                to={getDetailUrl(item)}
                className="flex-shrink-0 w-32 group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-muted">
                  <img
                    src={getImageUrl(item)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.score && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-xs">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {item.score.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
