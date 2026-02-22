import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnimeByGenre, getShortAnime, Anime, SupportedLanguage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { HorizontalScroll } from "./HorizontalScroll";
import { AnimeCard } from "./AnimeCard";
import { MobileAnimeCard } from "./MobileAnimeCard";
import { CardSkeletonRow } from "./skeletons/CardSkeleton";
import { SectionError } from "./SectionError";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface MoodConfig {
  id: string;
  title: string;
  emoji: string;
  genre: string;
  accentClass: string; // Tailwind text color for accent
  sort?: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC";
  /** If true, uses getShortAnime (≤12 eps) instead of genre filter */
  useShortFilter?: boolean;
}

export const MOOD_CONFIGS: MoodConfig[] = [
  { id: "cry", title: "Make Me Cry", emoji: "💧", genre: "Drama", accentClass: "text-blue-400", sort: "SCORE_DESC" },
  { id: "adrenaline", title: "Pure Adrenaline", emoji: "⚡", genre: "Action", accentClass: "text-red-400", sort: "TRENDING_DESC" },
  { id: "cozy", title: "Cozy Vibes", emoji: "☕", genre: "Slice of Life", accentClass: "text-amber-400", sort: "SCORE_DESC" },
  { id: "mind", title: "Mind-Bending", emoji: "🧠", genre: "Psychological", accentClass: "text-purple-400", sort: "SCORE_DESC" },
  { id: "epic", title: "Epic Adventures", emoji: "⚔️", genre: "Adventure", accentClass: "text-emerald-400", sort: "POPULARITY_DESC" },
  { id: "binge", title: "Late Night Binge", emoji: "🌙", genre: "", accentClass: "text-indigo-400", sort: "SCORE_DESC", useShortFilter: true },
  { id: "gems", title: "Hidden Gems", emoji: "💎", genre: "Fantasy", accentClass: "text-cyan-400", sort: "SCORE_DESC" },
];

function useMoodAnime(mood: MoodConfig, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: mood.useShortFilter
      ? ["moodAnime", "short", language]
      : ["moodAnime", mood.genre, mood.sort, language],
    queryFn: () =>
      mood.useShortFilter
        ? getShortAnime(1, 15, language as SupportedLanguage)
        : getAnimeByGenre(mood.genre, 1, 15, mood.sort, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled,
  });
}

interface MoodRowProps {
  mood: MoodConfig;
  enabled?: boolean;
}

const MoodRow = memo(function MoodRow({ mood, enabled = true }: MoodRowProps) {
  const { data, isLoading, isError, refetch } = useMoodAnime(mood, enabled);
  const isMobile = useIsMobile();

  return (
    <section className="py-3 sm:py-5">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Mood header with emoji and accent color */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl">{mood.emoji}</span>
          <h2 className={cn("text-base sm:text-lg md:text-xl font-bold tracking-tight", mood.accentClass)}>
            {mood.title}
          </h2>
        </div>

        {isError ? (
          <SectionError onRetry={() => refetch()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {isLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              data?.slice(0, 10).map((anime, index) => (
                <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  {isMobile ? (
                    <MobileAnimeCard anime={anime} index={index} />
                  ) : (
                    <AnimeCard anime={anime} index={index} />
                  )}
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </div>
    </section>
  );
});

interface MoodSectionsProps {
  /** Only render moods at these indices from MOOD_CONFIGS */
  indices?: number[];
  enabled?: boolean;
}

export const MoodSections = memo(function MoodSections({ indices, enabled = true }: MoodSectionsProps) {
  const moods = indices ? indices.map(i => MOOD_CONFIGS[i]).filter(Boolean) : MOOD_CONFIGS;
  
  return (
    <>
      {moods.map((mood) => (
        <MoodRow key={mood.id} mood={mood} enabled={enabled} />
      ))}
    </>
  );
});
