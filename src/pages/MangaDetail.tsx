import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Star, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle, Send, User, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [selectedChapter, setSelectedChapter] = useState(1);
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

  // Comments query - using a simple query without FK join
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["chapter-comments", Number(id), selectedChapter],
    queryFn: async () => {
      // Note: We don't have chapter_comments table, so return empty array for now
      return [];
    },
    enabled: !!id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would add comment mutation here when table exists
  };

  // Generate mock chapter data
  const generateChapters = (count: number) => {
    const published = manga?.published?.from ? new Date(manga.published.from) : new Date();
    return Array.from({ length: Math.min(count, 50) }, (_, i) => {
      const chapterDate = new Date(published);
      chapterDate.setDate(chapterDate.getDate() + (i * 7));
      return {
        number: i + 1,
        title: `Chapter ${i + 1}`,
        released: chapterDate.toISOString(),
        pages: Math.floor(18 + Math.random() * 12),
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">Error Loading Manga</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const chapters = manga ? generateChapters(manga.chapters || 30) : [];
  const currentChapter = chapters.find(ch => ch.number === selectedChapter);

  return (
    <div className="min-h-screen bg-background">
      {/* ============ SECTION 1: FULLSCREEN READER ============ */}
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

            {/* Manga Reader */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background/80 to-background">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 mx-auto">
                  <BookOpen className="w-10 h-10 text-foreground" />
                </div>
                <h2 className="text-2xl font-sacred font-bold mb-2">{manga?.title}</h2>
                <p className="text-muted-foreground mb-2">Chapter {selectedChapter}</p>
                <p className="text-sm text-muted-foreground">{currentChapter?.pages || 20} pages</p>
                <Button variant="primary" size="lg" className="gap-2 mt-6">
                  <BookOpen className="w-4 h-4" />
                  Start Reading
                </Button>
              </div>
            </div>

            {/* Bottom controls overlay */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6 transition-all duration-500",
              showLogo ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <div className="container mx-auto">
                {/* Title and chapter info */}
                <div className="mb-4">
                  <h1 className="text-xl sm:text-2xl font-sacred font-bold text-white mb-1">{manga?.title}</h1>
                  <p className="text-white/70 text-sm">Chapter {selectedChapter} of {chapters.length}</p>
                </div>

                {/* Chapter selector */}
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    disabled={selectedChapter <= 1}
                    onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2">
                      {chapters.slice(0, 20).map((ch) => (
                        <button
                          key={ch.number}
                          onClick={() => setSelectedChapter(ch.number)}
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                            selectedChapter === ch.number
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {ch.number}
                        </button>
                      ))}
                      {chapters.length > 20 && (
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-white/50 text-sm">
                          +{chapters.length - 20}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    disabled={selectedChapter >= chapters.length}
                    onClick={() => setSelectedChapter(prev => Math.min(chapters.length, prev + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Read Chapter {selectedChapter}
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
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Chapter {selectedChapter} Discussion</h2>
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this chapter... (Sign in to comment)"
                  className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
                  rows={3}
                />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 3: SYNOPSIS, GENRES, AUTHORS, INFO (All in One Box) ============ */}
      <section className="py-12 sm:py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="liquid-glass rounded-2xl p-5 sm:p-8">
              {/* Header with cover */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Cover */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden">
                    <img
                      src={manga?.images.webp.large_image_url}
                      alt={manga?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Title and quick stats */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold font-sacred mb-2">{manga?.title}</h2>
                  <p className="font-jp text-sm text-muted-foreground mb-2">{manga?.title_japanese}</p>
                  
                  {/* Author */}
                  {manga?.authors?.[0] && (
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-4">
                      <User className="w-4 h-4" />
                      By {manga.authors.map(a => a.name).join(", ")}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                    {manga?.score && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <Star className="w-4 h-4 fill-foreground text-foreground" />
                        <span className="font-bold">{formatScore(manga.score)}</span>
                      </div>
                    )}
                    {manga?.chapters && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>{manga.chapters} Chapters</span>
                      </div>
                    )}
                    {manga?.rank && (
                      <div className="px-3 py-1.5 rounded-full bg-foreground/10 text-sm font-bold">
                        #{manga.rank} Ranked
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <h3 className="text-lg font-bold font-sacred mb-3">Synopsis</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {manga?.synopsis || "No synopsis available."}
                </p>
              </div>

              {/* Genres */}
              {manga?.genres && manga.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-sacred mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {manga.genres.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/manga?genre=${genre.mal_id}`}
                        className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors */}
              {manga?.authors && manga.authors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-sacred mb-3">Authors</h3>
                  <div className="flex flex-wrap gap-2">
                    {manga.authors.map((author) => (
                      <span
                        key={author.mal_id}
                        className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {author.name}
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
                    { label: "Type", value: manga?.type },
                    { label: "Chapters", value: manga?.chapters },
                    { label: "Volumes", value: manga?.volumes },
                    { label: "Status", value: manga?.status },
                    { label: "Published", value: manga?.published?.string },
                    { label: "Rank", value: manga?.rank ? `#${manga.rank}` : undefined },
                    { label: "Popularity", value: manga?.popularity ? `#${manga.popularity}` : undefined },
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
