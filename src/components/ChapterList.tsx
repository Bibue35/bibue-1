import { Star, Calendar, BookOpen, ChevronRight } from "lucide-react";
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
    <div className="space-y-2">
      {chapters.map((chapter) => {
        const isSelected = selectedChapter === chapter.number;
        
        return (
          <button
            key={chapter.number}
            onClick={() => onSelectChapter(chapter.number)}
            className={cn(
              "w-full text-left group cursor-pointer rounded-xl p-3 transition-all duration-300",
              "liquid-glass-subtle hover:bg-foreground/5",
              "sun-glow moon-glow",
              isSelected && "ring-2 ring-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Chapter number badge */}
              <div className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all relative",
                "sun-corona moon-phase-hover",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/50 group-hover:bg-primary/20"
              )}>
                <span className="relative z-10">{chapter.number}</span>
              </div>
              
              {/* Chapter info */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium text-sm truncate transition-colors",
                  isSelected ? "text-primary" : "group-hover:text-primary"
                )}>
                  {chapter.title || `Chapter ${chapter.number}`}
                </h4>
                
                {/* Metadata row */}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {chapter.released && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(chapter.released).toLocaleDateString()}</span>
                    </div>
                  )}
                  {chapter.score && chapter.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-primary" />
                      <span className="font-medium">{chapter.score.toFixed(1)}</span>
                    </div>
                  )}
                  {chapter.pages && (
                    <span className="text-muted-foreground">
                      {chapter.pages} pages
                    </span>
                  )}
                </div>
              </div>
              
              {/* Read/Select indicator */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/30 opacity-0 group-hover:opacity-100"
              )}>
                {isSelected ? (
                  <BookOpen className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
