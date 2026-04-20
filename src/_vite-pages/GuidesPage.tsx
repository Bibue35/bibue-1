import { Link } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { watchOrderGuides } from "@/data/watchOrderGuides";
import { BookOpen, ChevronRight } from "lucide-react";

const GuidesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO
        title="Anime Watch Order Guides (2026)"
        description="Complete watch order guides for popular anime franchises. Find the best order to watch Fate, Naruto, JoJo, Monogatari, Dragon Ball, and more."
        url="/guides"
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Watch Order Guides</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Not sure where to start? Our watch order guides break down the best way to experience
            popular anime franchises — whether you prefer release order or chronological viewing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchOrderGuides.map((guide) => (
            <Link
              key={guide.slug}
              to={`/guide/${guide.slug}`}
              className="group block rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
            >
              <div className={`h-24 bg-gradient-to-r ${guide.bannerColor} flex items-center justify-center`}>
                <BookOpen className="w-10 h-10 text-white/80" />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {guide.franchise}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {guide.introduction.slice(0, 120)}...
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{guide.releaseOrder.length} entries</span>
                  <span className="flex items-center gap-0.5 text-primary group-hover:translate-x-0.5 transition-transform">
                    View guide <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuidesPage;
