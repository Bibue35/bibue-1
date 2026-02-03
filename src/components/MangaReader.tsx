import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, List, X, MessageCircle, Send, User, ArrowUp } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import bibueLogo from "@/assets/bibue-logo-horizontal.png";

interface MangaReaderProps {
  mangaId: number;
  mangaTitle: string;
  mangaImageUrl?: string;
  selectedChapter: number;
  totalChapters: number;
  firstChapter: number;
  lastChapter: number;
  onChapterChange: (chapter: number) => void;
  onClose: () => void;
  onNavigate?: () => void;
}

export function MangaReader({
  mangaId,
  mangaTitle,
  mangaImageUrl,
  selectedChapter,
  totalChapters,
  firstChapter,
  lastChapter,
  onChapterChange,
  onClose,
  onNavigate,
}: MangaReaderProps) {
  const navigate = useNavigate();
  const { updateProgress } = useReadingProgress(mangaId, "manga");
  const [showControls, setShowControls] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newComment, setNewComment] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate mock pages for the chapter
  const pageCount = 18 + Math.floor(Math.random() * 12);
  const pages = Array.from({ length: pageCount }, (_, i) => ({
    number: i + 1,
    // Use placeholder images that simulate manga pages
    url: `https://picsum.photos/seed/${mangaId}-${selectedChapter}-${i}/800/1200`,
  }));

  // Generate chapter list for dropdown
  const chapters = Array.from({ length: totalChapters }, (_, i) => lastChapter - i);

  // Track reading progress when chapter changes
  useEffect(() => {
    if (user) {
      updateProgress({
        chapterNumber: selectedChapter,
        title: mangaTitle,
        imageUrl: mangaImageUrl,
      });
    }
  }, [selectedChapter, user, mangaTitle, mangaImageUrl]);

  // Handle scroll for back-to-top button and header visibility
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        setShowBackToTop(scrollTop > 500);
        // Hide full header after scrolling 100px, show only Bibue
        setShowControls(scrollTop < 100);
      }
    };

    const ref = scrollRef.current;
    ref?.addEventListener("scroll", handleScroll);
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top when chapter changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedChapter]);

  // Comments query
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["chapter-comments", mangaId, selectedChapter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .eq("manga_id", mangaId)
        .eq("category", `chapter-${selectedChapter}`)
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
          category: `chapter-${selectedChapter}`,
          title: `${mangaTitle} - Chapter ${selectedChapter}`,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", mangaId, selectedChapter] });
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
    if (selectedChapter > firstChapter) {
      onChapterChange(selectedChapter - 1);
    }
  };
  
  const goToNextChapter = () => {
    if (selectedChapter < lastChapter) {
      onChapterChange(selectedChapter + 1);
    }
  };

  // Swipe gesture for chapter navigation
  const { containerRef: swipeRef, swipeState } = useSwipeGesture({
    onSwipeLeft: goToNextChapter,
    onSwipeRight: goToPrevChapter,
    threshold: 120,
    minSwipeDistance: 30,
  });

  return createPortal(
    <div ref={swipeRef} className="fixed inset-0 z-[9999] bg-[#0a0a0a] overflow-hidden">
      {/* Fixed Header - Collapsible on scroll */}
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
          {/* Left: Logo and title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Link to="/manga" className="flex-shrink-0">
              <img 
                src={bibueLogo} 
                alt="Bibue" 
                className="h-10 sm:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
            </Link>
            <div className="hidden xs:block h-4 w-px bg-border/50" />
            <h1 className="hidden xs:block text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[400px]">
              {mangaTitle}
            </h1>
          </div>

          {/* Center: Chapter Navigation */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === firstChapter}
              onClick={() => onChapterChange(firstChapter)}
            >
              <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === firstChapter}
              onClick={goToPrevChapter}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Chapter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 min-w-[90px] sm:min-w-[120px] h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Chapter</span> {selectedChapter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                {chapters.map((ch) => (
                  <DropdownMenuItem
                    key={ch}
                    onClick={() => onChapterChange(ch)}
                    className={cn(ch === selectedChapter && "bg-primary/10 text-primary")}
                  >
                    Chapter {ch}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === lastChapter}
              onClick={goToNextChapter}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === lastChapter}
              onClick={() => onChapterChange(lastChapter)}
            >
              <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Right: Close button */}
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

      {/* Floating Bibue - Always visible when header is hidden */}
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

      {/* Scrollable Content - below fixed header */}
      <div ref={scrollRef} className="absolute top-11 sm:top-14 left-0 right-0 bottom-0 overflow-y-auto">
        {/* Chapter Title */}
        <div className="text-center py-4 sm:py-8 border-b border-border/10">
          <h2 className="text-base sm:text-xl font-bold font-sacred text-foreground line-clamp-1 px-4">{mangaTitle}</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">Chapter {selectedChapter}</p>
        </div>

        {/* Manga Pages - Vertical Scroll */}
        <div className="max-w-4xl mx-auto">
          {pages.map((page) => (
            <div key={page.number} className="relative">
              <img
                src={page.url}
                alt={`Page ${page.number}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* End of Chapter Navigation */}
        <div className="max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2 sm:gap-4 py-6 sm:py-8 border-t border-b border-border/20">
            <Button
              variant="outline"
              size="default"
              disabled={selectedChapter === firstChapter}
              onClick={goToPrevChapter}
              className="gap-1.5 sm:gap-2 h-10 sm:h-11 text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Previous</span> Chapter
            </Button>
            <Button
              variant="default"
              size="default"
              disabled={selectedChapter === lastChapter}
              onClick={goToNextChapter}
              className="gap-1.5 sm:gap-2 h-10 sm:h-11 text-xs sm:text-sm"
            >
              Next Chapter
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          <div className="py-6 sm:py-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-base sm:text-xl font-bold font-sacred">
                Ch. {selectedChapter} Comments
              </h3>
            </div>

            {/* Comment Form */}
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

            {/* Comments List */}
            <div className="space-y-3 sm:space-y-4">
              {commentsLoading ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                  Loading comments...
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="rounded-lg sm:rounded-xl p-3 sm:p-4 bg-muted/30 border border-border/20"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        {(comment.profiles as any)?.avatar_url ? (
                          <img 
                            src={(comment.profiles as any).avatar_url} 
                            alt="" 
                            className="w-full h-full rounded-full object-cover" 
                          />
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
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {comment.content}
                        </p>
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

      {/* Swipe Indicators */}
      {swipeState.isSwiping && (
        <>
          {/* Left indicator (next chapter) */}
          {swipeState.direction === "left" && (
            <div 
              className="fixed right-0 top-0 bottom-0 w-16 z-[10002] flex items-center justify-center pointer-events-none"
              style={{
                background: `linear-gradient(to left, hsl(var(--primary) / ${swipeState.progress * 0.4}), transparent)`,
              }}
            >
              <div 
                className="flex flex-col items-center gap-1 text-primary-foreground transition-transform"
                style={{ 
                  opacity: swipeState.progress,
                  transform: `translateX(${(1 - swipeState.progress) * 20}px)` 
                }}
              >
                <ChevronRight className="w-6 h-6" />
                <span className="text-xs font-medium">Next</span>
              </div>
            </div>
          )}
          {/* Right indicator (previous chapter) */}
          {swipeState.direction === "right" && (
            <div 
              className="fixed left-0 top-0 bottom-0 w-16 z-[10002] flex items-center justify-center pointer-events-none"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary) / ${swipeState.progress * 0.4}), transparent)`,
              }}
            >
              <div 
                className="flex flex-col items-center gap-1 text-primary-foreground transition-transform"
                style={{ 
                  opacity: swipeState.progress,
                  transform: `translateX(${(swipeState.progress - 1) * 20}px)` 
                }}
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="text-xs font-medium">Prev</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Back to Top Button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all duration-300",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>,
    document.body
  );
}
