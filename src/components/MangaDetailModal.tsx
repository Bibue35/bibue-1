import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, X, Star, Copy, Share2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface MangaDetailModalProps {
  mangaId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MangaDetailModal({ mangaId, open, onOpenChange }: MangaDetailModalProps) {
  const navigate = useNavigate();
  const { data: manga, isLoading } = useMangaDetails(mangaId, open);
  const [chapterRange, setChapterRange] = useState(0);

  // Generate mock chapter data
  const generateChapters = (count: number) => {
    return Array.from({ length: Math.min(count, 50) }, (_, i) => ({
      number: count - i, // Descending order
      title: `Chapter ${count - i}`,
      released: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    }));
  };

  const chapters = manga ? generateChapters(manga.chapters || 50) : [];
  const chaptersPerPage = 10;
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);
  const displayedChapters = chapters.slice(
    chapterRange * chaptersPerPage,
    (chapterRange + 1) * chaptersPerPage
  );

  const handleRead = (chapterNumber?: number) => {
    onOpenChange(false);
    navigate(`/manga/${mangaId}`, { state: { chapter: chapterNumber || 1 } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{manga?.title || "Manga Details"}</DialogTitle>
        </VisuallyHidden>
        
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image Section */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img
                  src={manga?.images?.webp?.large_image_url}
                  alt={manga?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h1 className="text-2xl sm:text-4xl font-bold font-sacred text-foreground mb-1">
                    {manga?.title}
                  </h1>
                  <p className="text-sm text-muted-foreground font-jp mb-3">
                    {manga?.title_japanese}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {manga?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-foreground text-foreground" />
                        {formatScore(manga.score)}
                        {manga.scored_by && (
                          <span className="text-muted-foreground">
                            ({(manga.scored_by / 1000).toFixed(0)}k)
                          </span>
                        )}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(manga?.published?.from || "").getFullYear()}</span>
                    {manga?.status && (
                      <>
                        <span>•</span>
                        <span>{manga.status}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                className="gap-2"
                onClick={() => handleRead(1)}
              >
                <BookOpen className="w-4 h-4" />
                READ
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              Add To List
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Synopsis */}
          <div className="px-6 sm:px-8 py-6">
            <h2 className="text-lg font-bold font-sacred mb-3">SYNOPSIS</h2>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {manga?.synopsis || "No synopsis available."}
              </p>
            )}

            {/* Genres */}
            {manga?.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {manga.genres.map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chapters Section */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-sacred">
                {chapters.length} CHAPTERS AVAILABLE
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {chapterRange * chaptersPerPage + 1}-{Math.min((chapterRange + 1) * chaptersPerPage, chapters.length)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={chapterRange === 0}
                  onClick={() => setChapterRange(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={chapterRange >= totalPages - 1}
                  onClick={() => setChapterRange(prev => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chapter List */}
            <div className="space-y-1">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : (
                displayedChapters.map((ch) => (
                  <button
                    key={ch.number}
                    onClick={() => handleRead(ch.number)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-lg text-left transition-all hover:bg-primary/10"
                  >
                    <span className="font-medium text-primary">
                      Chapter {ch.number}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(ch.released).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
