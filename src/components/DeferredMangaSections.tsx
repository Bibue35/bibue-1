import { SectionError } from "@/components/SectionError";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { CardSkeletonRow } from "@/components/skeletons";
import { DeferredAnimeSection } from "@/components/DeferredAnimeSection";
import { useTopManga, useTrendingManhwa, useTrendingManhua, useNewThisWeekManga, useCompletedManga, useMangaByGenre } from "@/hooks/useAnimeData";
import { TrendingUp, Trophy, Zap, Star, BookOpen, CheckCircle, Swords, Heart, Wand2 } from "lucide-react";
import { useMemo } from "react";

function MangaRow({ data, isLoading, isError, onRetry, isMobile }: {
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
        <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
      ) : (
        data?.slice(0, 12).map((manga, index) => (
          <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
            <MangaCard manga={manga} index={index} />
          </div>
        ))
      )}
    </HorizontalScroll>
  );
}

// Top Rated Manga (reuses mangaOnly data sorted by score)
export function DeferredTopRatedMangaSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Top Rated Manga" titleJp="高評価" icon={Trophy} linkTo="/manga?filter=manga&sort=score" isMobile={isMobile}>
      {(isVisible) => <TopRatedMangaContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function TopRatedMangaContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTopManga(1, 'manga', 'popularity', enabled);
  const sorted = useMemo(() => [...(data || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12), [data]);
  return <MangaRow data={sorted} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Trending Manhwa
export function DeferredTrendingManhwaSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Trending Manhwa" titleJp="韓国漫画" icon={Zap} linkTo="/manga?filter=manhwa" isMobile={isMobile}>
      {(isVisible) => <TrendingManhwaContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function TrendingManhwaContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTrendingManhwa(1, enabled);
  return <MangaRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Top Manhwa
export function DeferredTopManhwaSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Top Manhwa" titleJp="韓国トップ" icon={Star} linkTo="/manga?filter=manhwa&sort=score" isMobile={isMobile}>
      {(isVisible) => <TopManhwaContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function TopManhwaContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTopManga(1, 'manhwa', 'popularity', enabled);
  const sorted = useMemo(() => [...(data || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12), [data]);
  return <MangaRow data={sorted} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Trending Manhua
export function DeferredTrendingManhuaSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Trending Manhua" titleJp="中国漫画" icon={Zap} linkTo="/manga?filter=manhua" isMobile={isMobile}>
      {(isVisible) => <TrendingManhuaContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function TrendingManhuaContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTrendingManhua(1, enabled);
  return <MangaRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Top Manhua
export function DeferredTopManhuaSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Top Manhua" titleJp="中国トップ" icon={Star} linkTo="/manga?filter=manhua&sort=score" isMobile={isMobile}>
      {(isVisible) => <TopManhuaContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function TopManhuaContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useTopManga(1, 'manhua', 'popularity', enabled);
  const sorted = useMemo(() => [...(data || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12), [data]);
  return <MangaRow data={sorted} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// New This Week
export function DeferredNewThisWeekSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="New This Week" titleJp="今週の新作" icon={BookOpen} linkTo="/manga?collection=new" isMobile={isMobile}>
      {(isVisible) => <NewThisWeekContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function NewThisWeekContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useNewThisWeekManga(1);
  if (!enabled) return <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />;
  return <MangaRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Completed Series
export function DeferredCompletedSection({ isMobile }: { isMobile: boolean }) {
  return (
    <DeferredAnimeSection title="Completed Series" titleJp="完結作品" icon={CheckCircle} linkTo="/manga?collection=completed" isMobile={isMobile}>
      {(isVisible) => <CompletedContent isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function CompletedContent({ isMobile, enabled }: { isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useCompletedManga(1);
  if (!enabled) return <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />;
  return <MangaRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}

// Genre sections
export function DeferredMangaGenreSection({ genre, titleJp, icon, linkTo, isMobile }: {
  genre: string;
  titleJp: string;
  icon: typeof Swords;
  linkTo: string;
  isMobile: boolean;
}) {
  return (
    <DeferredAnimeSection title={genre} titleJp={titleJp} icon={icon} linkTo={linkTo} isMobile={isMobile}>
      {(isVisible) => <MangaGenreContent genre={genre} isMobile={isMobile} enabled={isVisible} />}
    </DeferredAnimeSection>
  );
}
function MangaGenreContent({ genre, isMobile, enabled }: { genre: string; isMobile: boolean; enabled: boolean }) {
  const { data, isLoading, isError, refetch } = useMangaByGenre(genre, 1);
  if (!enabled) return <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />;
  return <MangaRow data={data} isLoading={isLoading} isError={isError} onRetry={() => refetch()} isMobile={isMobile} />;
}
