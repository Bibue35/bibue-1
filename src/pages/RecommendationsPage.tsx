import { Link } from "react-router-dom";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useAuth } from "@/contexts/AuthContext";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { recommendations, isLoading, hasWatchlistItems } = useRecommendations();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to get recommendations</h1>
          <p className="text-muted-foreground">We'll suggest anime based on your watchlist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Personalized For You
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Recommendations
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-4">おすすめ</p>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Based on what you've added to your watchlist, here are some anime you might enjoy.
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
              ))}
            </div>
          ) : !hasWatchlistItems ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Add anime to your watchlist first</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We need to know what you like before we can recommend similar anime. Start by adding some to your watchlist!
              </p>
              <Button asChild>
                <Link to="/anime">
                  Browse Anime <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {recommendations.map((rec, index) => (
                <RecommendationCard key={rec.entry.mal_id} recommendation={rec} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No recommendations yet</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find recommendations for your current watchlist. Try adding more anime!
              </p>
              <Button asChild>
                <Link to="/anime">
                  Explore Anime <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
