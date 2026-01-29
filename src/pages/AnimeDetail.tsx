import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Heart, Share2, Bookmark } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { EpisodeComments } from "@/components/EpisodeComments";
import { EpisodeList } from "@/components/EpisodeList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "characters" | "reviews">("overview");
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // Generate mock episode data with dates and scores
  const generateEpisodes = (count: number) => {
    const aired = anime?.aired?.from ? new Date(anime.aired.from) : new Date();
    return Array.from({ length: Math.min(count, 24) }, (_, i) => {
      const episodeDate = new Date(aired);
      episodeDate.setDate(episodeDate.getDate() + (i * 7)); // Weekly episodes
      return {
        number: i + 1,
        title: `Episode ${i + 1}`,
        aired: episodeDate.toISOString(),
        score: 7.5 + (Math.random() * 2), // Mock score between 7.5-9.5
        filler: i === 5 || i === 12, // Mock filler episodes
        recap: i === 0,
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Error Loading Anime</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const episodes = anime ? generateEpisodes(anime.episodes || 12) : [];

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero Banner */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] pt-20">
        {isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <>
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={anime?.images.webp.large_image_url}
                alt={anime?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-16 sm:pt-20 pb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>

              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                {/* Poster */}
                <div className="flex-shrink-0 flex justify-center lg:justify-start">
                  <div className="w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden liquid-glass animate-scale-in sunbeam-hover">
                    <img
                      src={anime?.images.webp.large_image_url}
                      alt={anime?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 animate-fade-up text-center lg:text-left">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                    {anime?.genres?.slice(0, 4).map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/anime?genre=${genre.mal_id}`}
                        className="px-3 py-1 rounded-full liquid-glass-subtle text-sm font-medium hover:scale-105 transition-transform"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    {anime?.title}
                  </h1>
                  <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
                    {anime?.title_japanese}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {anime?.score && (
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl liquid-glass-subtle">
                        <Star className="w-4 sm:w-5 h-4 sm:h-5 text-foreground fill-foreground" />
                        <span className="font-bold text-base sm:text-lg">{formatScore(anime.score)}</span>
                        <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">({formatNumber(anime.scored_by)} votes)</span>
                      </div>
                    )}
                    {anime?.rank && (
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl liquid-glass-subtle">
                        <span className="font-bold text-base sm:text-lg">#{anime.rank}</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">Ranked</span>
                      </div>
                    )}
                    {anime?.popularity && (
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl liquid-glass-subtle">
                        <Users className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span className="font-bold text-sm sm:text-base">{formatNumber(anime.members)}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                    {anime?.episodes && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{anime.episodes} Episodes</span>
                      </div>
                    )}
                    {anime?.season && anime?.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{anime.season} {anime.year}</span>
                      </div>
                    )}
                    {anime?.studios?.[0] && (
                      <div className="flex items-center gap-2">
                        <span>Studio: {anime.studios[0].name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                    <Button size="lg" variant="divine" className="gap-2">
                      <Play className="w-5 h-5" />
                      Watch Now
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                      <Bookmark className="w-5 h-5" />
                      Add to List
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Content Tabs */}
      <section className="py-8 sm:py-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass w-fit mb-6 sm:mb-8 overflow-x-auto">
            {(["overview", "episodes", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && anime && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
              {/* Synopsis */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Synopsis</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {anime.synopsis || "No synopsis available."}
                  </p>
                </div>

                {/* Trailer */}
                {anime.trailer?.youtube_id && (
                  <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Trailer</h3>
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                        title="Trailer"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar info */}
              <div className="space-y-4 sm:space-y-6">
                <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Information</h3>
                  <dl className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{anime.source || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Episodes</dt>
                      <dd className="font-medium">{anime.episodes || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{anime.status || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Aired</dt>
                      <dd className="font-medium text-right">{anime.aired?.string || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Rating</dt>
                      <dd className="font-medium">{anime.rating || "N/A"}</dd>
                    </div>
                  </dl>
                </div>

              </div>
            </div>
          )}

          {activeTab === "episodes" && anime && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Episode list with hover effects */}
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4">Episodes</h3>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  <EpisodeList
                    episodes={episodes}
                    selectedEpisode={selectedEpisode}
                    onSelectEpisode={setSelectedEpisode}
                    animeTitle={anime.title}
                  />
                </div>
              </div>

              {/* Episode comments */}
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <EpisodeComments 
                  animeId={anime.mal_id} 
                  episodeNumber={selectedEpisode} 
                />
              </div>
            </div>
          )}

          {(activeTab === "characters" || activeTab === "reviews") && (
            <div className="liquid-glass rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
              <p className="text-muted-foreground text-base sm:text-lg">
                Coming Soon
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-jp">
                この機能は開発中です
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
