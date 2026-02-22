import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopAnime, Anime, SupportedLanguage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimeCard } from "./AnimeCard";
import { MobileAnimeCard } from "./MobileAnimeCard";
import { CardSkeletonRow } from "./skeletons/CardSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles } from "lucide-react";

export const KeepExploring = memo(function KeepExploring({ enabled = true }: { enabled?: boolean }) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const { data, isLoading } = useQuery({
    queryKey: ["keepExploring", language],
    queryFn: () => getTopAnime(2, 12, "bypopularity", language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled,
  });

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
            Keep Exploring
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}><CardSkeletonRow count={1} variant={isMobile ? "mobile" : "default"} /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {data?.slice(0, isMobile ? 6 : 12).map((anime, index) => (
              <div key={anime.anilist_id}>
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
