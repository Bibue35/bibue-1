import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeasonalAnime, getTopAnime, getTopManga, SupportedLanguage } from "@/lib/api";
import { generateNewsFromAnime, generateNewsFromManga, NewsArticle } from "@/lib/news";

export function useNewsData() {
  const { language } = useLanguage();

  // Fetch seasonal anime for seasonal news
  const { data: seasonalAnime, isLoading: seasonalLoading } = useQuery({
    queryKey: ["newsSeasonalAnime", language],
    queryFn: () => getSeasonalAnime(undefined, undefined, language as SupportedLanguage),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
  });

  // Fetch trending anime for trending news
  const { data: trendingAnime, isLoading: trendingLoading } = useQuery({
    queryKey: ["newsTrendingAnime", language],
    queryFn: () => getTopAnime(1, 10, "airing", language as SupportedLanguage),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Fetch upcoming anime for announcement news
  const { data: upcomingAnime, isLoading: upcomingLoading } = useQuery({
    queryKey: ["newsUpcomingAnime", language],
    queryFn: () => getTopAnime(1, 10, "upcoming", language as SupportedLanguage),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Fetch top manga for manga news
  const { data: topManga, isLoading: mangaLoading } = useQuery({
    queryKey: ["newsTopManga", language],
    queryFn: () => getTopManga(1, 10, undefined, "trending", language as SupportedLanguage),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const isLoading = seasonalLoading || trendingLoading || upcomingLoading || mangaLoading;

  // Generate news articles from fetched data
  const news: NewsArticle[] = [];

  if (seasonalAnime?.length) {
    news.push(...generateNewsFromAnime(seasonalAnime.slice(0, 3), "Seasonal"));
  }

  if (trendingAnime?.length) {
    news.push(...generateNewsFromAnime(trendingAnime.slice(0, 3), "Trending"));
  }

  if (upcomingAnime?.length) {
    news.push(...generateNewsFromAnime(upcomingAnime.slice(0, 2), "Announcement"));
  }

  if (topManga?.length) {
    news.push(...generateNewsFromManga(topManga.slice(0, 3), "New Release"));
  }

  // Sort by date (most recent first) and remove duplicates
  const uniqueNews = news.reduce((acc, article) => {
    if (!acc.find(a => a.id === article.id)) {
      acc.push(article);
    }
    return acc;
  }, [] as NewsArticle[]);

  uniqueNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    news: uniqueNews,
    featuredNews: uniqueNews.slice(0, 3),
    moreNews: uniqueNews.slice(3),
    isLoading,
  };
}
