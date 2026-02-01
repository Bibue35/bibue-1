import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimeDetailModal } from "./AnimeDetailModal";
import { Recommendation } from "@/hooks/useRecommendations";

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
}

export function RecommendationCard({ recommendation, index = 0 }: RecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { entry } = recommendation;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "block group animate-fade-up text-left w-full"
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className={cn(
          "relative aspect-[2/3] rounded-2xl overflow-hidden mb-2",
          "divine-card sun-glow moon-glow sun-rays-hover moon-reflection"
        )}>
          <img
            src={entry.images.webp.large_image_url || entry.images.jpg.large_image_url}
            alt={entry.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Score badge */}
          {entry.score && (
            <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {entry.score.toFixed(1)}
            </div>
          )}
        </div>

        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
          {entry.title}
        </h3>
      </button>
      
      <AnimeDetailModal
        animeId={entry.mal_id}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
