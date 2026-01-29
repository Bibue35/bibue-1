import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Heart, Share2, Bookmark, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "characters" | "reviews">("overview");

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Error Loading Anime</h1>
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

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative min-h-[70vh] pt-20">
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
            <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-display text-sm uppercase tracking-wider">Back</span>
              </Link>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <div className="w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-neon-lg animate-scale-in">
                    <img
                      src={anime?.images.webp.large_image_url}
                      alt={anime?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 animate-slide-up">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {anime?.genres?.slice(0, 4).map((genre) => (
                      <span
                        key={genre.mal_id}
                        className="px-3 py-1 rounded-full glass text-sm font-display border border-primary/30"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    {anime?.title}
                  </h1>
                  <p className="font-jp text-xl text-muted-foreground mb-6">
                    {anime?.title_japanese}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {anime?.score && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="font-display font-bold text-lg">{formatScore(anime.score)}</span>
                        <span className="text-muted-foreground text-sm">({formatNumber(anime.scored_by)} votes)</span>
                      </div>
                    )}
                    {anime?.rank && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                        <span className="font-display font-bold text-lg">#{anime.rank}</span>
                        <span className="text-muted-foreground text-sm">Ranked</span>
                      </div>
                    )}
                    {anime?.popularity && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                        <Users className="w-5 h-5 text-secondary" />
                        <span className="font-display font-bold">{formatNumber(anime.members)}</span>
                        <span className="text-muted-foreground text-sm">Members</span>
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                    {anime?.episodes && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{anime.episodes} Episodes</span>
                      </div>
                    )}
                    {anime?.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{anime.duration}</span>
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
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="xl" variant="glow">
                      <Play className="w-5 h-5" />
                      Watch Now
                    </Button>
                    <Button size="xl" variant="outline">
                      <Bookmark className="w-5 h-5" />
                      Add to List
                    </Button>
                    <Button size="icon" variant="ghost" className="w-12 h-12">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-12 h-12">
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
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass w-fit mb-8">
            {(["overview", "episodes", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 rounded-lg font-display text-sm uppercase tracking-wider transition-all duration-300",
                  activeTab === tab
                    ? "bg-gradient-anime text-primary-foreground shadow-neon"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && anime && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Synopsis */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Synopsis</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {anime.synopsis || "No synopsis available."}
                  </p>
                </div>

                {/* Trailer */}
                {anime.trailer?.youtube_id && (
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display text-xl font-bold mb-4">Trailer</h3>
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
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Information</h3>
                  <dl className="space-y-3 text-sm">
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
                      <dd className="font-medium">{anime.aired?.string || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Rating</dt>
                      <dd className="font-medium">{anime.rating || "N/A"}</dd>
                    </div>
                  </dl>
                </div>

                {/* External links */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-4">External Links</h3>
                  <div className="space-y-2">
                    <a
                      href={`https://myanimelist.net/anime/${anime.mal_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="font-display text-sm">MyAnimeList</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://anilist.co/search/anime?search=${encodeURIComponent(anime.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="font-display text-sm">AniList</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
              <p className="text-muted-foreground font-display text-lg uppercase tracking-wider">
                Coming Soon
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-jp">
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
