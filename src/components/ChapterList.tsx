import { Star, Calendar, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  number: number;
  title?: string;
  released?: string;
  score?: number;
  pages?: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: number;
  onSelectChapter: (chapter: number) => void;
  mangaTitle?: string;
}

export function ChapterList({ chapters, selectedChapter, onSelectChapter, mangaTitle }: ChapterListProps) {
  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <button
          key={chapter.number}
          onClick={() => onSelectChapter(chapter.number)}
          className={cn(
            "episode-card w-full text-left group cursor-pointer",
            selectedChapter === chapter.number && "ring-2 ring-primary/50"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Chapter number badge */}
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
                selectedChapter === chapter.number
                  ? "bg-primary text-primary-foreground"
                  : "liquid-glass-subtle group-hover:bg-primary/20"
              )}>
                {chapter.number}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {chapter.title || `Chapter ${chapter.number}`}
                </h4>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {chapter.released && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(chapter.released).toLocaleDateString()}</span>
                    </div>
                  )}
                  {chapter.score && chapter.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{chapter.score.toFixed(1)}</span>
                    </div>
                  )}
                  {chapter.pages && (
                    <span className="text-muted-foreground">
                      {chapter.pages} pages
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Read indicator */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full liquid-glass-subtle flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
