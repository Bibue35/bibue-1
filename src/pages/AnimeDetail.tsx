import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Heart, Share2, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { EpisodeComments } from "@/components/EpisodeComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";
import { HaloRing, HeavenlyCloud, LightBeams } from "@/components/DivineElements";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "characters" | "reviews">("overview");
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // Generate mock episode data
  const generateEpisodes = (count: number) => {
    const aired = anime?.aired?.from ? new Date(anime.aired.from) : new Date();
    return Array.from({ length: Math.min(count, 24) }, (_, i) => {
      const episodeDate = new Date(aired);
      episodeDate.setDate(episodeDate.getDate() + (i * 7));
      return {
        number: i + 1,
        title: `Episode ${i + 1}`,
        aired: episodeDate.toISOString(),
        score: 7.5 + (Math.random() * 2),
        filler: i === 5 || i === 12,
        recap: i === 0,
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">Error Loading Anime</h1>
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
  const currentEpisode = episodes.find(ep => ep.number === selectedEpisode);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero Banner */}
      <section className="relative min-h-[50vh] pt-20">
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
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
              
              {/* Divine elements */}
              <div className="hidden divine:block">
                <LightBeams className="opacity-30" />
                <HeavenlyCloud className="absolute top-20 right-10" variant="large" />
                <HeavenlyCloud className="absolute top-32 left-20" variant="small" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-12 pb-8">
              <Link
                to="/anime"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Anime</span>
              </Link>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-40 aspect-[2/3] rounded-2xl overflow-hidden liquid-glass animate-scale-in">
                    {/* Divine halo */}
                    <div className="hidden divine:block absolute -top-8 left-1/2 -translate-x-1/2 w-32">
                      <HaloRing />
                    </div>
                    <img
                      src={anime?.images.webp.large_image_url}
                      alt={anime?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sacred mb-1 tracking-wide">
                    {anime?.title}
                  </h1>
                  <p className="font-jp text-sm text-muted-foreground mb-4">
                    {anime?.title_japanese}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    {anime?.score && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-sm">
                        <Star className="w-4 h-4 text-foreground fill-foreground" />
                        <span className="font-bold">{formatScore(anime.score)}</span>
                      </div>
                    )}
                    {anime?.episodes && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{anime.episodes} Episodes</span>
                      </div>
                    )}
                    {anime?.rank && (
                      <div className="px-3 py-1.5 rounded-full liquid-glass-subtle text-sm font-bold">
                        #{anime.rank} Ranked
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Button size="default" variant="primary" className="gap-2">
                      <Play className="w-4 h-4" />
                      Watch Now
                    </Button>
                    <Button size="default" variant="outline" className="gap-2">
                      <Bookmark className="w-4 h-4" />
                      Add to List
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Content Tabs */}
      <section className="py-6 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass w-fit mb-6 overflow-x-auto">
            {(["overview", "episodes", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && anime && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Synopsis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {anime.synopsis || "No synopsis available."}
                  </p>
                </div>

                {anime.trailer?.youtube_id && (
                  <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-lg font-bold font-sacred mb-3">Trailer</h3>
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

              <div className="space-y-4">
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-base font-bold font-sacred mb-3">Information</h3>
                  <dl className="space-y-2 text-sm">
                    {[
                      { label: "Source", value: anime.source },
                      { label: "Episodes", value: anime.episodes },
                      { label: "Status", value: anime.status },
                      { label: "Aired", value: anime.aired?.string },
                      { label: "Rating", value: anime.rating },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium text-right">{value || "N/A"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {anime.genres && anime.genres.length > 0 && (
                  <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-base font-bold font-sacred mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((genre) => (
                        <Link
                          key={genre.mal_id}
                          to={`/anime?genre=${genre.mal_id}`}
                          className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/80 transition-colors"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Episodes Tab - Completely Redesigned */}
          {activeTab === "episodes" && anime && (
            <div className="animate-fade-in space-y-6">
              {/* Episode Viewer Header */}
              <div className="liquid-glass rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Episode Navigation */}
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={selectedEpisode <= 1}
                      onClick={() => setSelectedEpisode(prev => Math.max(1, prev - 1))}
                      className="rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    <div className="relative">
                      {/* Divine halo for episode number */}
                      <div className="hidden divine:block absolute -top-4 left-1/2 -translate-x-1/2 w-20">
                        <HaloRing />
                      </div>
                      <div className="w-20 h-20 rounded-2xl liquid-glass-strong flex items-center justify-center">
                        <span className="text-3xl font-bold font-sacred">{selectedEpisode}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={selectedEpisode >= episodes.length}
                      onClick={() => setSelectedEpisode(prev => Math.min(episodes.length, prev + 1))}
                      className="rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-xl font-bold font-sacred mb-2">
                      Episode {selectedEpisode}: {currentEpisode?.title || `Episode ${selectedEpisode}`}
                    </h2>
                    {currentEpisode && (
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground mb-3">
                        {currentEpisode.aired && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(currentEpisode.aired).toLocaleDateString()}
                          </span>
                        )}
                        {currentEpisode.score && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-foreground text-foreground" />
                            {currentEpisode.score.toFixed(1)}
                          </span>
                        )}
                        {currentEpisode.filler && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs">Filler</span>
                        )}
                      </div>
                    )}
                    <Button variant="primary" className="gap-2">
                      <Play className="w-4 h-4" />
                      Watch Episode {selectedEpisode}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Episode Grid + Comments */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Episode Grid */}
                <div className="lg:col-span-2 liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-4">All Episodes</h3>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {episodes.map((ep) => (
                      <button
                        key={ep.number}
                        onClick={() => setSelectedEpisode(ep.number)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                          selectedEpisode === ep.number
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                          ep.filler && "opacity-60"
                        )}
                      >
                        {ep.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="liquid-glass rounded-2xl p-5">
                  <EpisodeComments 
                    animeId={anime.mal_id} 
                    episodeNumber={selectedEpisode} 
                  />
                </div>
              </div>
            </div>
          )}

          {(activeTab === "characters" || activeTab === "reviews") && (
            <div className="liquid-glass rounded-2xl p-8 text-center animate-fade-in">
              <p className="text-muted-foreground text-lg font-sacred">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2 font-jp">この機能は開発中です</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
