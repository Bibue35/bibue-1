import { SectionError } from "@/components/SectionError";
import { AnimeCard } from "@/components/AnimeCard";
import { MobileAnimeCard } from "@/components/MobileAnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { CardSkeletonRow } from "@/components/skeletons";
import { DeferredAnimeSection } from "@/components/DeferredAnimeSection";
import { useTopAnime, useClassicAnime, useAllTimeTopAnime, useAnimeByGenre } from "@/hooks/useAnimeData";
import { TrendingUp, Clock, Trophy, History, Swords, Heart, Wand2, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function AnimeRow({ data, isLoading, isError, onRetry, isMobile }: {
  data?: any[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isMobile: boolean;
}) {
  if (isError) return <SectionError onRetry={onRetry} />;
  return (
    <HorizontalScroll showArrows={!isMobile}>
      {isLoading ? (
        <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
      ) : (
        data?.slice(0, 12).map((anime, index) => (
          <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
            {isMobile ? <MobileAnimeCard anime={anime} index={index} /> : <AnimeCard anime={anime} index={index} />}
          </div>
        ))
      )}
    </HorizontalScroll>
  );
}

export function DeferredPopularSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useLanguage();
  return (
    <DeferredAnimeSection title={t("anime.mostPopular")} titleJp={t("anime.mostPopularJp")} icon={TrendingUp} linkTo="/anime?filter=bypopularity" isMobile={isMobile}>
      {(isVisible) => <PopularContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function PopularContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTopAnime(1, 'bypopularity', enabled);
  return <AnimeRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

export function DeferredUpcomingSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useLanguage();
  return (
    <DeferredAnimeSection title={t("anime.comingSoon")} titleJp={t("anime.comingSoonJp")} icon={Clock} linkTo="/anime?filter=upcoming" isMobile={isMobile}>
      {(isVisible) => <UpcomingContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function UpcomingContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTopAnime(1, 'upcoming', enabled);
  return <AnimeRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

export function DeferredClassicSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useLanguage();
  return (
    <DeferredAnimeSection title={t("anime.classicAnime")} titleJp={t("anime.classicAnimeJp")} icon={History} linkTo="/classics" linkText={t("section.browseByDecade")} isMobile={isMobile}>
      {(isVisible) => <ClassicContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function ClassicContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useClassicAnime(1, enabled);
  return <AnimeRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

export function DeferredAllTimeTopSection({ isMobile }: { isMobile: boolean }) {
  const { t } = useLanguage();
  return (
    <DeferredAnimeSection title={t("anime.allTimeTop")} titleJp={t("anime.allTimeTopJp")} icon={Trophy} linkTo="/anime?filter=bypopularity" isMobile={isMobile}>
      {(isVisible) => <AllTimeTopContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function AllTimeTopContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useAllTimeTopAnime(1, enabled);
  return <AnimeRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

export function DeferredGenreSection({ genre, titleJp, icon, linkTo, isMobile }: {
  genre: string;
  titleJp: string;
  icon: typeof Swords;
  linkTo: string;
  isMobile: boolean;
}) {
  return (
    <DeferredAnimeSection title={genre} titleJp={titleJp} icon={icon} linkTo={linkTo} isMobile={isMobile}>
      {(isVisible) => <GenreContent genre={genre} isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function GenreContent({ genre, isMobile, enabled }: { genre: string; isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useAnimeByGenre(genre, 1, "POPULARITY_DESC");
  // Only fetch when enabled - useAnimeByGenre has `enabled: !!genre` but we also need visibility check
  if (!enabled) return <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />;
  return <AnimeRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}
