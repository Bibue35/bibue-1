import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Star, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle, Send, User, Maximize2, Minimize2, Eye, Clock, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [isReading, setIsReading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  // Hide controls after 3 seconds of inactivity in reading mode
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    if (isReading) {
      window.addEventListener("mousemove", handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isReading]);

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
    return Array.from({ length: Math.min(count, 100) }, (_, i) => {
      const chapterDate = new Date(published);
      chapterDate.setDate(chapterDate.getDate() + (i * 7));
      return {
        number: count - i, // Descending order like DemonicScans
        title: `Chapter ${count - i}`,
        released: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
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

  const chapters = manga ? generateChapters(manga.chapters || 50) : [];
  const totalChapters = chapters.length;
  const firstChapter = chapters[chapters.length - 1]?.number || 1;
  const lastChapter = chapters[0]?.number || totalChapters;
  const currentChapter = chapters.find(ch => ch.number === selectedChapter);

  // Navigation helpers
  const goToFirstChapter = () => setSelectedChapter(firstChapter);
  const goToLastChapter = () => setSelectedChapter(lastChapter);
  const goToPrevChapter = () => setSelectedChapter(prev => Math.max(firstChapter, prev - 1));
  const goToNextChapter = () => setSelectedChapter(prev => Math.min(lastChapter, prev + 1));

  // Reading Mode View
  if (isReading) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Minimal Top - Only Bibue exit button, always visible */}
        <Link
          to="/"
          className="absolute top-4 left-4 z-50 text-2xl font-sacred font-semibold text-white hover:text-primary transition-colors"
        >
          Bibue
        </Link>
        
        {/* Exit reading mode - right side */}
        <button
          onClick={() => setIsReading(false)}
          className="absolute top-4 right-4 z-50 text-sm text-white/60 hover:text-white transition-colors"
        >
          Exit Reader
        </button>

        {/* Chapter info - shows on hover */}
        <div className={cn(
          "absolute top-14 left-4 z-40 transition-all duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-white/50 text-sm">
            Ch. {selectedChapter} • {currentChapter?.pages || 20} pages
          </span>
        </div>

        {/* Reader Content */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 mx-auto">
              <BookOpen className="w-10 h-10 text-foreground" />
            </div>
            <h2 className="text-2xl font-sacred font-bold text-white mb-2">{manga?.title}</h2>
            <p className="text-white/60 mb-2">Chapter {selectedChapter}</p>
            <p className="text-sm text-white/40">{currentChapter?.pages || 20} pages</p>
          </div>
        </div>

        {/* Bottom Chapter Navigation - Enhanced */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent transition-all duration-500",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex flex-col items-center gap-3 p-4 sm:p-6">
            {/* Quick Jump Buttons */}
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
                disabled={selectedChapter === firstChapter}
                onClick={goToFirstChapter}
              >
                <ChevronsLeft className="w-4 h-4 mr-1" />
                First
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
                disabled={selectedChapter === lastChapter}
                onClick={goToLastChapter}
              >
                Latest
                <ChevronsRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                disabled={selectedChapter === firstChapter}
                onClick={goToPrevChapter}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <div className="text-center min-w-[120px]">
                <p className="text-white font-medium">Chapter {selectedChapter}</p>
                <p className="text-white/50 text-sm">{currentChapter?.title}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                disabled={selectedChapter === lastChapter}
                onClick={goToNextChapter}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DemonicScans Style Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top - just Bibue logo, scrolls with page */}
      <div className="container mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <Link to="/" className="text-2xl font-sacred font-semibold text-foreground hover:text-primary transition-colors">
          Bibue
        </Link>
        <Link to="/manga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Manga
        </Link>
      </div>

      {/* ============ SECTION 1: MANGA INFO - DemonicScans Style ============ */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Cover + Actions */}
              <div className="flex-shrink-0 w-full lg:w-72">
                <div className="sticky top-24">
                  {/* Cover Image */}
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-2xl">
                    {isLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <img
                        src={manga?.images.webp.large_image_url}
                        alt={manga?.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Action Buttons - Enhanced */}
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedChapter(firstChapter);
                        setIsReading(true);
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Start Reading
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setSelectedChapter(firstChapter);
                          setIsReading(true);
                        }}
                      >
                        <ChevronsLeft className="w-3 h-3" />
                        Ch. 1
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setSelectedChapter(lastChapter);
                          setIsReading(true);
                        }}
                      >
                        Ch. {lastChapter}
                        <ChevronsRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Bookmark className="w-4 h-4" />
                      Bookmark
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                    {manga?.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-bold text-foreground">{formatScore(manga.score)}</span>
                      </div>
                    )}
                    {manga?.members && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{(manga.members / 1000).toFixed(0)}k</span>
                      </div>
                    )}
                    {manga?.favorites && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{(manga.favorites / 1000).toFixed(1)}k</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Title, Synopsis, Chapters */}
              <div className="flex-1 min-w-0">
                {/* Title Section */}
                <div className="mb-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-10 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-bold font-sacred mb-2">{manga?.title}</h1>
                      
                      {/* Genres inline */}
                      {manga?.genres && manga.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {manga.genres.map((genre) => (
                            <Link
                              key={genre.mal_id}
                              to={`/manga?genre=${genre.mal_id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Synopsis */}
                <div className="mb-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {manga?.synopsis || "No synopsis available."}
                    </p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
                  {[
                    { label: "Author", value: manga?.authors?.map(a => a.name).join(", ") },
                    { label: "Rating", value: manga?.score ? `${manga.score}%` : undefined },
                    { label: "Status", value: manga?.status },
                    { label: "Last Update", value: chapters[0]?.released ? new Date(chapters[0].released).toLocaleDateString() : undefined },
                    { label: "Alternatives", value: manga?.title_japanese },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-muted-foreground">{label}</span>
                      <p className="font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Chapters Section - DemonicScans Style */}
                <div className="liquid-glass rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-sacred">
                      {chapters.length} Chapters Available
                    </h2>
                  </div>

                  {/* Chapter List */}
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-1">
                      {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))
                      ) : (
                        chapters.map((chapter) => {
                          const isSelected = selectedChapter === chapter.number;
                          const releaseDate = new Date(chapter.released);
                          
                          return (
                            <button
                              key={chapter.number}
                              onClick={() => {
                                setSelectedChapter(chapter.number);
                                setIsReading(true);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between py-3 px-4 rounded-lg text-left transition-all",
                                "hover:bg-primary/10",
                                isSelected && "bg-primary/20"
                              )}
                            >
                              <span className={cn(
                                "font-medium",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>
                                Chapter {chapter.number}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {releaseDate.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: '2-digit', 
                                  day: '2-digit' 
                                })}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 2: COMMENTS ============ */}
      <section className="py-12 sm:py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Comment Section</h2>
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts... (Sign in to comment)"
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
    </div>
  );
}
