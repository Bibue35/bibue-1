import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Calendar, Clock, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { EpisodeComments } from "@/components/EpisodeComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ScrollWings, FloatingHalo, AmbientClouds } from "@/components/ScrollWings";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const synopsisRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const episodes = anime ? generateEpisodes(anime.episodes || 12) : [];
  const currentEpisode = episodes.find(ep => ep.number === selectedEpisode);

  return (
    <div className="min-h-screen bg-background relative">
      <CollapsibleNavbar />
      
      {/* Ambient divine elements - always visible in light mode */}
      <AmbientClouds className="z-0" />

      {/* ============ SECTION 1: VIDEO PLAYER (Hero) ============ */}
      <section ref={playerRef} className="relative min-h-screen pt-16">
        {isLoading ? (
          <div className="absolute inset-0 pt-20 px-4">
            <Skeleton className="w-full h-[60vh] rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Full background */}
            <div className="absolute inset-0 z-0">
              <img
                src={anime?.images.webp.large_image_url}
                alt={anime?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </div>

            {/* Floating halo above title */}
            <FloatingHalo className="absolute top-24 left-1/2 -translate-x-1/2 w-64 z-10" />

            {/* Player content */}
            <div className="relative z-10 container mx-auto px-4 pt-8 sm:pt-12">
              {/* Title & Quick Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sacred tracking-wide mb-2">
                  {anime?.title}
                </h1>
                <p className="font-jp text-sm sm:text-base text-muted-foreground mb-4">
                  {anime?.title_japanese}
                </p>
                
                {/* Quick stats */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {anime?.score && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                      <span className="font-bold">{formatScore(anime.score)}</span>
                    </div>
                  )}
                  {anime?.episodes && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                  )}
                  {anime?.status && (
                    <div className="px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      {anime.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player Area */}
              <div className="max-w-5xl mx-auto">
                <div className="liquid-glass-strong rounded-2xl sm:rounded-3xl overflow-hidden">
                  {anime?.trailer?.youtube_id ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0`}
                        title={`${anime.title} Trailer`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted/20">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center mb-4 mx-auto">
                          <Play className="w-8 h-8" />
                        </div>
                        <p className="text-muted-foreground font-sacred">No trailer available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Episode selector below player */}
                <div className="mt-4 sm:mt-6 liquid-glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-sacred font-medium">Episode {selectedEpisode}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={selectedEpisode <= 1}
                        onClick={() => setSelectedEpisode(prev => Math.max(1, prev - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{selectedEpisode} / {episodes.length}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={selectedEpisode >= episodes.length}
                        onClick={() => setSelectedEpisode(prev => Math.min(episodes.length, prev + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Episode grid */}
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {episodes.map((ep) => (
                      <button
                        key={ep.number}
                        onClick={() => setSelectedEpisode(ep.number)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                          selectedEpisode === ep.number
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {ep.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <Button variant="primary" size="lg" className="gap-2">
                    <Play className="w-4 h-4" />
                    Watch Episode {selectedEpisode}
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Bookmark className="w-4 h-4" />
                    Add to List
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scroll down to comments indicator with wings */}
            <div className="relative z-10 mt-8">
              <ScrollWings 
                direction="down" 
                label="View Comments" 
                onClick={() => scrollToSection(commentsRef)}
              />
            </div>
          </>
        )}
      </section>

      {/* ============ SECTION 2: COMMENTS ============ */}
      <section ref={commentsRef} className="relative py-12 sm:py-16 min-h-[80vh]">
        {/* Scroll up to synopsis */}
        <ScrollWings 
          direction="up" 
          label="Synopsis & Info" 
          onClick={() => scrollToSection(synopsisRef)}
          className="mb-8"
        />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Episode {selectedEpisode} Discussion</h2>
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {anime && (
                <EpisodeComments 
                  animeId={anime.mal_id} 
                  episodeNumber={selectedEpisode} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Scroll down to synopsis */}
        <ScrollWings 
          direction="down" 
          label="Synopsis & Details" 
          onClick={() => scrollToSection(synopsisRef)}
          className="mt-8"
        />
      </section>

      {/* ============ SECTION 3: SYNOPSIS & INFO ============ */}
      <section ref={synopsisRef} className="relative py-12 sm:py-16 min-h-screen">
        {/* Scroll up to comments */}
        <ScrollWings 
          direction="up" 
          label="Back to Comments" 
          onClick={() => scrollToSection(commentsRef)}
          className="mb-8"
        />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Synopsis & Poster */}
            <div className="lg:col-span-2 space-y-6">
              {/* Poster + Synopsis combined */}
              <div className="liquid-glass rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Poster */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden">
                      <FloatingHalo className="absolute -top-8 left-1/2 -translate-x-1/2 w-32" />
                      <img
                        src={anime?.images.webp.large_image_url}
                        alt={anime?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Synopsis */}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-sacred mb-3">Synopsis</h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {anime?.synopsis || "No synopsis available."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/anime?genre=${genre.mal_id}`}
                        className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Information */}
            <div className="space-y-4">
              <div className="liquid-glass rounded-2xl p-5">
                <h3 className="text-lg font-bold font-sacred mb-4">Information</h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: "Source", value: anime?.source },
                    { label: "Episodes", value: anime?.episodes },
                    { label: "Status", value: anime?.status },
                    { label: "Aired", value: anime?.aired?.string },
                    { label: "Rating", value: anime?.rating },
                    { label: "Rank", value: anime?.rank ? `#${anime.rank}` : undefined },
                    { label: "Popularity", value: anime?.popularity ? `#${anime.popularity}` : undefined },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Studios */}
              {anime?.studios && anime.studios.length > 0 && (
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Studios</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <span
                        key={studio.mal_id}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {studio.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll back to player */}
        <ScrollWings 
          direction="up" 
          label="Back to Player" 
          onClick={() => scrollToSection(playerRef)}
          className="mt-12"
        />
      </section>
    </div>
  );
}
