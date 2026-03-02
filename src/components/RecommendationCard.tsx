import { useState, lazy, Suspense } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/api";
import { Recommendation } from "@/hooks/useRecommendations";
import { WatchlistButton } from "./WatchlistButton";

const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
const MangaDetailModal = lazy(() => import("./MangaDetailModal").then(m => ({ default: m.MangaDetailModal })));

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
}

export function RecommendationCard({ recommendation, index = 0 }: RecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { entry, mediaType } = recommendation;
  const isManga = mediaType !== "anime";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "block group/card animate-fade-up text-left w-full active:scale-[0.98] transition-transform duration-150 isolate"
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="bg-card border border-border/60 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 group-hover/card:border-primary/50 group-hover/card:-translate-y-3 group-hover/card:shadow-2xl group-hover/card:shadow-primary/20 will-change-transform transform-gpu">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={entry.images.webp.large_image_url || entry.images.jpg.large_image_url}
              alt={entry.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
            {/* Score badge */}
            {entry.score && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/70 backdrop-blur-sm text-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium flex items-center gap-1">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-primary text-primary" />
                {formatScore(entry.score)}
              </div>
            )}

            {/* Save button */}
            <div
              className="absolute top-2 left-2 sm:top-3 sm:left-3 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <WatchlistButton
                mal_id={entry.anilist_id}
                media_type={isManga ? "manga" : "anime"}
                title={entry.title}
                image_url={entry.images.webp.image_url}
                score={entry.score}
                variant="icon"
                className="bg-background/70 backdrop-blur-sm hover:bg-background h-7 w-7 sm:h-8 sm:w-8"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 md:p-5">
            <h3 className="font-semibold text-[11px] sm:text-sm md:text-base leading-tight line-clamp-1 sm:line-clamp-2 text-card-foreground group-hover/card:text-primary transition-colors">
              {entry.title}
            </h3>
            {'reason' in recommendation && recommendation.reason && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
                {String(recommendation.reason)}
              </p>
            )}
          </div>
        </div>
      </button>

      {modalOpen && (
        <Suspense fallback={null}>
          {isManga ? (
            <MangaDetailModal
              mangaId={entry.anilist_id}
              open={modalOpen}
              onOpenChange={setModalOpen}
            />
          ) : (
            <AnimeDetailModal
              animeId={entry.anilist_id}
              open={modalOpen}
              onOpenChange={setModalOpen}
            />
          )}
        </Suspense>
      )}
    </>
  );
}
