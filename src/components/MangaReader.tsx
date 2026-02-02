import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  selectedChapter: number;
  totalChapters: number;
  firstChapter: number;
  lastChapter: number;
  onChapterChange: (chapter: number) => void;
  onClose: () => void;
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
}: MangaReaderProps) {
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

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowBackToTop(scrollRef.current.scrollTop > 500);
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

  const goToPrevChapter = () => onChapterChange(Math.max(firstChapter, selectedChapter - 1));
  const goToNextChapter = () => onChapterChange(Math.min(lastChapter, selectedChapter + 1));

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo and title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/manga"
              className="text-xl font-sacred font-semibold text-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              Bibue
            </Link>
            <div className="hidden sm:block h-4 w-px bg-border/50" />
            <h1 className="hidden sm:block text-sm text-muted-foreground truncate max-w-[200px] lg:max-w-[400px]">
              {mangaTitle}
            </h1>
          </div>

          {/* Center: Chapter Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === firstChapter}
              onClick={() => onChapterChange(firstChapter)}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === firstChapter}
              onClick={goToPrevChapter}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Chapter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-[120px]">
                  <List className="w-4 h-4" />
                  Chapter {selectedChapter}
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
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === lastChapter}
              onClick={goToNextChapter}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={selectedChapter === lastChapter}
              onClick={() => onChapterChange(lastChapter)}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Chapter Title */}
        <div className="text-center py-8 border-b border-border/10">
          <h2 className="text-xl font-bold font-sacred text-foreground">{mangaTitle}</h2>
          <p className="text-muted-foreground mt-1">Chapter {selectedChapter}</p>
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
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center gap-4 py-8 border-t border-b border-border/20">
            <Button
              variant="outline"
              size="lg"
              disabled={selectedChapter === firstChapter}
              onClick={goToPrevChapter}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Chapter
            </Button>
            <Button
              variant="default"
              size="lg"
              disabled={selectedChapter === lastChapter}
              onClick={goToNextChapter}
              className="gap-2"
            >
              Next Chapter
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="py-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold font-sacred">
                Chapter {selectedChapter} Comments
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Share your thoughts on this chapter..." : "Sign in to comment..."}
                className="mb-3 resize-none bg-background/50 border-border/30"
                rows={3}
                disabled={!user}
              />
              <Button 
                type="submit" 
                disabled={!user || !newComment.trim() || addCommentMutation.isPending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {user ? "Post Comment" : "Sign in to Comment"}
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
                    className="rounded-xl p-4 bg-muted/30 border border-border/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        {(comment.profiles as any)?.avatar_url ? (
                          <img 
                            src={(comment.profiles as any).avatar_url} 
                            alt="" 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {(comment.profiles as any)?.username || "Anonymous"}
                          </span>
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
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  );
}
