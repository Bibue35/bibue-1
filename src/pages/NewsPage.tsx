import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { useNewsData } from "@/hooks/useNewsData";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { FeaturedNewsSkeleton, NewsGridSkeleton } from "@/components/news/NewsSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewsPage() {
  const { featuredNews, moreNews, isLoading } = useNewsData();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Latest News" description="Stay up to date with the latest anime and manga news, announcements, and updates." url="/news" />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              {t("news.latestNews")}
            </h1>
            {language === "ja" && <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-2">{t("news.latestNewsJp")}</p>}
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("news.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {isLoading ? (
            <FeaturedNewsSkeleton />
          ) : featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeaturedNewsCard
                article={featuredNews[0]}
                size="large"
                className="lg:row-span-2"
              />
              {featuredNews.slice(1, 3).map((article) => (
                <FeaturedNewsCard
                  key={article.id}
                  article={article}
                  size="medium"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("news.noFeatured")}
            </div>
          )}
        </div>
      </section>

      {/* News List */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8">{t("news.moreNews")}</h2>
          
          {isLoading ? (
            <NewsGridSkeleton />
          ) : moreNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreNews.map((article, index) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("news.noMore")}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
