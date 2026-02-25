import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, List, X, MessageCircle, Send, User, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useMangaDexPages, type MangaDexChapter } from "@/hooks/useMangaDex";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MangaReaderProps {
  mangaId: number;
  mangaTitle: string;
  mangaImageUrl?: string;
  chapterId: string;
  chapterNumber: string;
  chapters: MangaDexChapter[];
  onChapterChange: (chapterId: string) => void;
  onClose: () => void;
  onNavigate?: () => void;
}

export function MangaReader({
  mangaId,
  mangaTitle,
  mangaImageUrl,
  chapterId,
  chapterNumber,
  chapters,
  onChapterChange,
  onClose,
  onNavigate,
}: MangaReaderProps) {
  const navigate = useNavigate();
  const { updateProgress } = useReadingProgress(mangaId, "manga");
  const [showControls, setShowControls] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [useDataSaver, setUseDataSaver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch actual chapter pages from MangaDex
  const { data: pageData, isLoading: pagesLoading, isError: pagesError } = useMangaDexPages(chapterId);
  
  const pages = useDataSaver ? (pageData?.dataSaver || []) : (pageData?.pages || []);

  // Current chapter index in the sorted list
  const currentIdx = chapters.findIndex(ch => ch.id === chapterId);
  const prevChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;
  const nextChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;

  // Track reading progress
  useEffect(() => {
    if (user && chapterNumber) {
      updateProgress({
        chapterNumber: Math.floor(parseFloat(chapterNumber)),
        title: mangaTitle,
        imageUrl: mangaImageUrl,
      });
    }
  }, [chapterId, user, mangaTitle, mangaImageUrl, chapterNumber]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        setShowBackToTop(scrollTop > 500);
        setShowControls(scrollTop < 100);
      }
    };
    const ref = scrollRef.current;
    ref?.addEventListener("scroll", handleScroll);
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on chapter change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapterId]);

  // Comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["chapter-comments", mangaId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`id, content, created_at, user_id, profiles:user_id (username, avatar_url)`)
        .eq("manga_id", mangaId)
        .eq("category", `chapter-${chapterNumber}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Please sign in to comment");
      const { error } = await supabase
        .from("discussions")
        .insert({
          user_id: user.id,
          manga_id: mangaId,
          category: `chapter-${chapterNumber}`,
          title: `${mangaTitle} - Chapter ${chapterNumber}`,
          content,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", mangaId, chapterNumber] });
      toast({ title: "Comment posted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    const validation = validateComment(trimmedComment);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    addCommentMutation.mutate(trimmedComment);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevChapter = () => {
    if (prevChapter) onChapterChange(prevChapter.id);
  };
  
  const goToNextChapter = () => {
    if (nextChapter) onChapterChange(nextChapter.id);
  };

  const { containerRef: swipeRef, swipeState } = useSwipeGesture({
    onSwipeLeft: goToNextChapter,
    onSwipeRight: goToPrevChapter,
    threshold: 120,
    minSwipeDistance: 30,
  });

  return createPortal(
    <div ref={swipeRef} className="fixed inset-0 z-[9999] bg-[#0a0a0a] overflow-hidden">
      {/* Fixed Header */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-[10000] bg-[#0a0a0a] border-b border-border/20 transition-all duration-300",
          !showControls && "border-transparent bg-transparent pointer-events-none"
        )}
      >
        <div className={cn(
          "flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 transition-opacity duration-300",
          !showControls && "opacity-0"
        )}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <span className="text-lg sm:text-xl font-sacred font-semibold text-foreground flex-shrink-0">
              Bibue
            </span>
            <div className="hidden xs:block h-4 w-px bg-border/50" />
            <h1 className="hidden xs:block text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[400px]">
              {mangaTitle}
            </h1>
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={!prevChapter}
              onClick={goToPrevChapter}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 min-w-[90px] sm:min-w-[120px] h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Ch.</span> {chapterNumber}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                {chapters.map((ch) => (
                  <DropdownMenuItem
                    key={ch.id}
                    onClick={() => onChapterChange(ch.id)}
                    className={cn(ch.id === chapterId && "bg-primary/10 text-primary")}
                  >
                    Ch. {ch.chapter} {ch.title ? `— ${ch.title}` : ''}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={!nextChapter}
              onClick={goToNextChapter}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground gap-1.5 sm:gap-2 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Bibue logo */}
      <Link
        to="/manga"
        onClick={(e) => {
          e.preventDefault();
          onNavigate?.();
          navigate("/manga");
        }}
        className={cn(
          "fixed top-3 left-3 sm:top-4 sm:left-4 z-[10001] text-lg sm:text-xl font-sacred font-semibold text-foreground hover:text-primary transition-all duration-300",
          showControls && "opacity-0 pointer-events-none"
        )}
      >
        Bibue
      </Link>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="absolute top-11 sm:top-14 left-0 right-0 bottom-0 overflow-y-auto">
        {/* Chapter Title */}
        <div className="text-center py-4 sm:py-8 border-b border-border/10">
          <h2 className="text-base sm:text-xl font-bold font-sacred text-foreground line-clamp-1 px-4">{mangaTitle}</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">Chapter {chapterNumber}</p>
          {/* Data saver toggle */}
          <button
            onClick={() => setUseDataSaver(prev => !prev)}
            className="mt-2 text-[10px] sm:text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            {useDataSaver ? '📶 Data Saver ON' : '🖼️ Full Quality'}
          </button>
        </div>

        {/* Manga Pages */}
        <div className="max-w-4xl mx-auto">
          {pagesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Loading pages...</span>
            </div>
          ) : pagesError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <p className="text-sm">Failed to load chapter pages.</p>
              <p className="text-xs">This chapter may not be available.</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <p className="text-sm">No pages available for this chapter.</p>
            </div>
          ) : (
            pages.map((pageUrl, idx) => (
              <div key={idx} className="relative">
                <img
                  src={pageUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-auto"
                  loading={idx < 3 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))
          )}
        </div>

        {/* MangaDex Attribution - NO ADS HERE */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-muted/30 border border-border/20">
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Chapter content provided by{' '}
              <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                MangaDex
              </a>
              {' '}• Please support the official release
            </span>
          </div>
        </div>

        {/* End of Chapter Navigation */}
        <div className="max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2 sm:gap-4 py-6 sm:py-8 border-t border-b border-border/20">
            <Button
              variant="outline"
              size="default"
              disabled={!prevChapter}
              onClick={goToPrevChapter}
              className="gap-1.5 sm:gap-2 h-10 sm:h-11 text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Previous</span> Chapter
            </Button>
            <Button
              variant="default"
              size="default"
              disabled={!nextChapter}
              onClick={goToNextChapter}
              className="gap-1.5 sm:gap-2 h-10 sm:h-11 text-xs sm:text-sm"
            >
              Next Chapter
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Comments Section - NO ADS */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          <div className="py-6 sm:py-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-base sm:text-xl font-bold font-sacred">
                Ch. {chapterNumber} Comments
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Share your thoughts..." : "Sign in to comment..."}
                className="mb-2 sm:mb-3 resize-none bg-background/50 border-border/30 text-xs sm:text-sm"
                rows={2}
                disabled={!user}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!user || !newComment.trim() || addCommentMutation.isPending}
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {user ? "Post" : "Sign in"}
              </Button>
            </form>

            <div className="space-y-3 sm:space-y-4">
              {commentsLoading ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                  Loading comments...
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg sm:rounded-xl p-3 sm:p-4 bg-muted/30 border border-border/20">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        {(comment.profiles as any)?.avatar_url ? (
                          <img src={(comment.profiles as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className="font-medium text-xs sm:text-sm">
                            {(comment.profiles as any)?.username || "Anonymous"}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                  <p className="text-xs sm:text-sm">No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10001] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Swipe Indicators */}
      {swipeState.isSwiping && (
        <>
          {swipeState.direction === "left" && nextChapter && (
            <div 
              className="fixed right-0 top-0 bottom-0 w-16 z-[10002] flex items-center justify-center pointer-events-none"
              style={{ background: `linear-gradient(to left, hsl(var(--primary) / ${swipeState.progress * 0.4}), transparent)` }}
            >
              <div className="flex flex-col items-center gap-1 text-primary-foreground transition-transform"
                style={{ opacity: swipeState.progress, transform: `translateX(${(1 - swipeState.progress) * 20}px)` }}>
                <ChevronRight className="w-6 h-6" />
                <span className="text-xs font-medium">Next</span>
              </div>
            </div>
          )}
          {swipeState.direction === "right" && prevChapter && (
            <div 
              className="fixed left-0 top-0 bottom-0 w-16 z-[10002] flex items-center justify-center pointer-events-none"
              style={{ background: `linear-gradient(to right, hsl(var(--primary) / ${swipeState.progress * 0.4}), transparent)` }}
            >
              <div className="flex flex-col items-center gap-1 text-primary-foreground transition-transform"
                style={{ opacity: swipeState.progress, transform: `translateX(${-(1 - swipeState.progress) * 20}px)` }}>
                <ChevronLeft className="w-6 h-6" />
                <span className="text-xs font-medium">Prev</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>,
    document.body
  );
}
