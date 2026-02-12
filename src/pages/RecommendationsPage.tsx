import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, ArrowRight, BookOpen, Tv } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useRecommendations, MediaType } from "@/hooks/useRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeType, setActiveType] = useState<MediaType>("anime");
  const { recommendations, isLoading, hasWatchlistItems, watchlistCount } = useRecommendations(activeType);

  const mediaTypes: { value: MediaType; label: string; icon: typeof Tv }[] = [
    { value: "anime", label: t("stats.anime"), icon: Tv },
    { value: "manga", label: t("stats.manga"), icon: BookOpen },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("recommendations.signIn")}</h1>
          <p className="text-muted-foreground">{t("recommendations.signInDesc")}</p>
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
              {t("recommendations.personalized")}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              {t("recommendations.title")}
            </h1>
            {language === "ja" && <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-4">{t("recommendations.titleJp")}</p>}
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("recommendations.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Media Type Toggle */}
      <section className="pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            {mediaTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setActiveType(type.value)}
                className={cn(
                  "px-5 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  activeType === type.value
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {hasWatchlistItems && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              {t("recommendations.basedOn")} {watchlistCount} {activeType === "anime" ? "anime" : "manga"} {t("recommendations.inLibrary")}
            </p>
          )}
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
              <h2 className="text-xl font-bold mb-2">
                {t("recommendations.addFirstDesc").split(".")[0]}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("recommendations.addFirstDesc")}
              </p>
              <Button asChild>
                <Link to={activeType === "anime" ? "/anime" : "/manga"}>
                  {t("recommendations.browse")} {activeType === "anime" ? "Anime" : "Manga"} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {recommendations.map((rec, index) => (
                <RecommendationCard
                  key={rec.entry.anilist_id}
                  recommendation={rec}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("recommendations.noRecs")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("recommendations.noRecsDesc")}
              </p>
              <Button asChild>
                <Link to={activeType === "anime" ? "/anime" : "/manga"}>
                  {t("recommendations.explore")} {activeType === "anime" ? "Anime" : "Manga"} <ArrowRight className="w-4 h-4 ml-2" />
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
