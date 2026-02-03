import { Newspaper } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { useNewsData } from "@/hooks/useNewsData";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { FeaturedNewsSkeleton, NewsGridSkeleton } from "@/components/news/NewsSkeleton";

export default function NewsPage() {
  const { featuredNews, moreNews, isLoading } = useNewsData();

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center sunbeam-hover">
                <Newspaper className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Latest News
            </h1>
            <p className="font-jp text-xl text-muted-foreground mb-2">最新ニュース</p>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest anime and manga news, announcements, and industry updates.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <FeaturedNewsSkeleton />
          ) : featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main featured */}
              <FeaturedNewsCard
                article={featuredNews[0]}
                size="large"
                className="lg:row-span-2"
              />

              {/* Secondary featured */}
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
              No featured news available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* News List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">More News</h2>
          
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
              No additional news available.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
