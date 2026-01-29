import { Newspaper, Calendar, ExternalLink, User } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

// Mock news data since Jikan news endpoint requires specific anime IDs
const mockNews = [
  {
    id: 1,
    title: "Winter 2024 Anime Season Highlights",
    excerpt: "The most anticipated anime of the winter season are finally here. From action-packed sequels to heartwarming originals, here's what you need to watch.",
    date: "2024-01-15",
    author: "Bibue Staff",
    category: "Seasonal",
    image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg"
  },
  {
    id: 2,
    title: "Attack on Titan Final Season: A Complete Retrospective",
    excerpt: "As the epic saga concludes, we look back at the journey that defined a generation of anime fans.",
    date: "2024-01-10",
    author: "Editorial Team",
    category: "Review",
    image: "https://cdn.myanimelist.net/images/anime/1000/110531l.jpg"
  },
  {
    id: 3,
    title: "Solo Leveling Anime Breaks Streaming Records",
    excerpt: "The long-awaited adaptation of the popular Korean manhwa has exceeded all expectations.",
    date: "2024-01-08",
    author: "News Desk",
    category: "Industry",
    image: "https://cdn.myanimelist.net/images/anime/1963/142153l.jpg"
  },
  {
    id: 4,
    title: "Crunchyroll Announces Major Partnership with Japanese Studios",
    excerpt: "New deals promise more simulcasts and exclusive content for subscribers.",
    date: "2024-01-05",
    author: "Industry Watch",
    category: "Industry",
    image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg"
  },
  {
    id: 5,
    title: "Jujutsu Kaisen Season 3 Confirmed for Fall 2024",
    excerpt: "MAPPA announces continuation of the hit supernatural action series.",
    date: "2024-01-03",
    author: "News Desk",
    category: "Announcement",
    image: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg"
  },
  {
    id: 6,
    title: "Chainsaw Man Part 2 Animation in Production",
    excerpt: "Denji's story continues as MAPPA confirms work on the next arc.",
    date: "2024-01-01",
    author: "Editorial Team",
    category: "Announcement",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg"
  }
];

export default function NewsPage() {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main featured */}
            <div className="group relative rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-auto lg:row-span-2">
              <img
                src={mockNews[0].image}
                alt={mockNews[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full liquid-glass-subtle text-sm text-primary mb-3">
                  {mockNews[0].category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {mockNews[0].title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {mockNews[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {mockNews[0].author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(mockNews[0].date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary featured */}
            {mockNews.slice(1, 3).map((news) => (
              <div
                key={news.id}
                className="group relative rounded-2xl overflow-hidden aspect-[16/9]"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 rounded-full liquid-glass-subtle text-xs text-accent mb-2">
                    {news.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{news.author}</span>
                    <span>{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">More News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockNews.slice(3).map((news, index) => (
              <article
                key={news.id}
                className="group liquid-glass rounded-2xl overflow-hidden hover-lift animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full liquid-glass-strong text-xs font-medium">
                    {news.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {news.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{news.author}</span>
                    <span>{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full">
              Load More News
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
