import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Clock, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle, Send, User, X, Maximize2, Minimize2 } from "lucide-react";
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
  const [showLogo, setShowLogo] = useState(true);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  // Hide logo after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowLogo(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowLogo(false), 3000);
    };
    
    if (isFullscreen) {
      window.addEventListener("mousemove", handleMouseMove);
      timeout = setTimeout(() => setShowLogo(false), 3000);
    } else {
      setShowLogo(true);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Comments query - simplified without join since there's no FK
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

  return (
    <div className="min-h-screen bg-background">
      {/* ============ SECTION 1: FULLSCREEN VIDEO PLAYER ============ */}
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
                "absolute top-4 left-4 z-50 transition-all duration-500",
                showLogo ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <span className="text-2xl font-sacred font-semibold text-white drop-shadow-lg hover:text-primary transition-colors">
                Bibue
              </span>
            </Link>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                "absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-500",
                showLogo ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Video Player */}
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

            {/* Bottom controls overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6 transition-all duration-500",
              showLogo ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <div className="container mx-auto">
                {/* Title and episode info */}
                <div className="mb-4">
                  <h1 className="text-xl sm:text-2xl font-sacred font-bold text-white mb-1">{anime?.title}</h1>
                  <p className="text-white/70 text-sm">Episode {selectedEpisode} of {episodes.length}</p>
                </div>

                {/* Episode selector */}
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    disabled={selectedEpisode <= 1}
                    onClick={() => setSelectedEpisode(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2">
                      {episodes.map((ep) => (
                        <button
                          key={ep.number}
                          onClick={() => setSelectedEpisode(ep.number)}
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                            selectedEpisode === ep.number
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {ep.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    disabled={selectedEpisode >= episodes.length}
                    onClick={() => setSelectedEpisode(prev => Math.min(episodes.length, prev + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" className="gap-2">
                    <Play className="w-4 h-4" />
                    Play Episode {selectedEpisode}
                  </Button>
                  <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Bookmark className="w-4 h-4" />
                    Add to List
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ============ SECTION 2: COMMENTS (Scroll Down) ============ */}
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
                  placeholder="Share your thoughts on this episode... (Sign in to comment)"
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
                            <span className="font-medium text-sm">User</span>
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

      {/* ============ SECTION 3: SYNOPSIS, GENRES, STUDIO, INFO (All in One Box) ============ */}
      <section className="py-12 sm:py-16 border-t border-border/30">
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
    </div>
  );
}
