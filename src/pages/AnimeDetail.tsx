import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Clock, Heart, Bookmark, MessageCircle, Send, User, Maximize2, Minimize2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    if (isFullscreen) {
      window.addEventListener("mousemove", handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Comments query
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["episode-comments", Number(id), selectedEpisode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select("*")
        .eq("anime_id", Number(id))
        .eq("episode_number", selectedEpisode)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to comment");

      const { error } = await supabase
        .from("episode_comments")
        .insert({
          user_id: user.id,
          anime_id: Number(id),
          episode_number: selectedEpisode,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  // Generate mock episode data with thumbnails
  const generateEpisodes = (count: number) => {
    const aired = anime?.aired?.from ? new Date(anime.aired.from) : new Date();
    return Array.from({ length: Math.min(count, 24) }, (_, i) => {
      const episodeDate = new Date(aired);
      episodeDate.setDate(episodeDate.getDate() + (i * 7));
      return {
        number: i + 1,
        title: `Episode ${i + 1}`,
        description: i === 0 ? anime?.synopsis?.slice(0, 100) + "..." : `The story continues in episode ${i + 1}...`,
        aired: episodeDate.toISOString(),
        thumbnail: anime?.images?.webp?.large_image_url,
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
    <div className="min-h-screen bg-background">
      {/* ============ SECTION 1: FULLSCREEN VIDEO PLAYER - AnimeRealms Style ============ */}
      <section className={cn(
        "relative bg-black transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "h-screen"
      )}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Bibue Logo - Click to exit */}
            <Link
              to="/"
              className={cn(
                "absolute top-6 left-6 z-50 transition-all duration-500",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <span className="text-2xl font-sacred font-semibold text-white drop-shadow-lg hover:text-primary transition-colors">
                Bibue
              </span>
            </Link>

            {/* Top Right Controls */}
            <div className={cn(
              "absolute top-6 right-6 z-50 flex items-center gap-3 transition-all duration-500",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Video Player Area */}
            <div className="w-full h-full">
              {anime?.trailer?.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3`}
                  title={`${anime.title} - Episode ${selectedEpisode}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background/80 to-background">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 mx-auto">
                      <Play className="w-10 h-10 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-sacred font-bold mb-2">{anime?.title}</h2>
                    <p className="text-muted-foreground">Episode {selectedEpisode}</p>
                    <p className="text-sm text-muted-foreground mt-4">Video player coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Episode Carousel - AnimeRealms Style */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 transition-all duration-500",
              showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
              
              <div className="relative px-4 sm:px-8 pb-6 pt-20">
                {/* Currently Playing Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-white font-bold text-lg sm:text-xl truncate">{anime?.title}</h2>
                    <p className="text-white/60 text-sm">Episode {selectedEpisode} • {currentEpisode?.title}</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span>EP {selectedEpisode}/{episodes.length}</span>
                  </div>
                </div>

                {/* Episode Carousel */}
                <div className="relative group">
                  {/* Scroll Left Button */}
                  <button 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2"
                    onClick={() => {
                      const container = document.getElementById('episode-carousel');
                      if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Episodes */}
                  <div 
                    id="episode-carousel"
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {episodes.map((ep) => {
                      const isPlaying = selectedEpisode === ep.number;
                      const isWatched = ep.number < selectedEpisode;
                      
                      return (
                        <button
                          key={ep.number}
                          onClick={() => setSelectedEpisode(ep.number)}
                          className={cn(
                            "flex-shrink-0 w-40 sm:w-48 group/card text-left rounded-lg overflow-hidden transition-all duration-200",
                            isPlaying 
                              ? "ring-2 ring-primary scale-105" 
                              : "hover:scale-102 hover:ring-1 hover:ring-white/30"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-black/50">
                            <img
                              src={ep.thumbnail}
                              alt={ep.title}
                              className={cn(
                                "w-full h-full object-cover transition-all",
                                isWatched && "opacity-60"
                              )}
                            />
                            
                            {/* Now Playing Badge */}
                            {isPlaying && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                  <Play className="w-3 h-3 fill-current" />
                                  NOW PLAYING
                                </div>
                              </div>
                            )}
                            
                            {/* Play overlay on hover */}
                            {!isPlaying && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                              </div>
                            )}
                            
                            {/* Watched indicator */}
                            {isWatched && (
                              <div className="absolute top-1.5 left-1.5 p-1 rounded-full bg-primary/80">
                                <Eye className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            
                            {/* Episode number badge */}
                            <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              E{ep.number}
                            </div>
                          </div>
                          
                          {/* Episode title */}
                          <div className="p-2 bg-black/60">
                            <p className={cn(
                              "text-xs font-medium truncate",
                              isPlaying ? "text-primary" : "text-white/80"
                            )}>
                              {ep.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Scroll Right Button */}
                  <button 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity translate-x-2"
                    onClick={() => {
                      const container = document.getElementById('episode-carousel');
                      if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ============ SECTION 2: SYNOPSIS, GENRES, STUDIO, INFO ============ */}
      <section className="py-12 sm:py-16 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="liquid-glass rounded-2xl p-5 sm:p-8">
              {/* Header with poster */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden">
                    <img
                      src={anime?.images.webp.large_image_url}
                      alt={anime?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Title and quick stats */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold font-sacred mb-2">{anime?.title}</h2>
                  <p className="font-jp text-sm text-muted-foreground mb-4">{anime?.title_japanese}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                    {anime?.score && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <Star className="w-4 h-4 fill-foreground text-foreground" />
                        <span className="font-bold">{formatScore(anime.score)}</span>
                      </div>
                    )}
                    {anime?.episodes && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{anime.episodes} Episodes</span>
                      </div>
                    )}
                    {anime?.rank && (
                      <div className="px-3 py-1.5 rounded-full bg-foreground/10 text-sm font-bold">
                        #{anime.rank} Ranked
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <h3 className="text-lg font-bold font-sacred mb-3">Synopsis</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {anime?.synopsis || "No synopsis available."}
                </p>
              </div>

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="mb-6">
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

              {/* Studio */}
              {anime?.studios && anime.studios.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-sacred mb-3">Studios</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <span
                        key={studio.mal_id}
                        className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {studio.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div>
                <h3 className="text-lg font-bold font-sacred mb-3">Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Source", value: anime?.source },
                    { label: "Episodes", value: anime?.episodes },
                    { label: "Status", value: anime?.status },
                    { label: "Aired", value: anime?.aired?.string },
                    { label: "Rating", value: anime?.rating },
                    { label: "Rank", value: anime?.rank ? `#${anime.rank}` : undefined },
                    { label: "Popularity", value: anime?.popularity ? `#${anime.popularity}` : undefined },
                    { label: "Duration", value: anime?.duration },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-muted-foreground text-xs mb-0.5">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 3: COMMENTS ============ */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Episode {selectedEpisode} Discussion</h2>
              {comments && (
                <span className="text-sm text-muted-foreground">({comments.length})</span>
              )}
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this episode..."
                  className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
                  rows={3}
                />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading comments...
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="liquid-glass-subtle rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Anonymous</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
