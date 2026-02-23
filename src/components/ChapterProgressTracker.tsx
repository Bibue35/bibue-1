import { useState, useCallback } from "react";
import { BookOpen, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChapterProgressTrackerProps {
  malId: number;
  totalChapters: number;
  mangaTitle: string;
}

export function ChapterProgressTracker({
  malId,
  totalChapters,
  mangaTitle,
}: ChapterProgressTrackerProps) {
  const { user } = useAuth();
  const { getWatchlistItem, updateProgress } = useWatchlist();
  const { toast } = useToast();

  const item = getWatchlistItem(malId, "manga");
  const read = item?.chapters_read || 0;
  const percent = totalChapters > 0 ? Math.round((read / totalChapters) * 100) : 0;
  const [inputValue, setInputValue] = useState("");

  const handleSetChapter = useCallback(() => {
    const num = parseInt(inputValue, 10);
    if (!item || isNaN(num) || num < 0) return;
    const clamped = Math.min(num, totalChapters || num);
    updateProgress.mutate({
      mal_id: malId,
      media_type: "manga",
      field: "chapters_read",
      value: clamped,
    });
    updateProgress.mutate({
      mal_id: malId,
      media_type: "manga",
      field: "last_chapter_read",
      value: clamped,
    });
    toast({
      title: `${mangaTitle}: Chapter ${clamped}${totalChapters ? ` of ${totalChapters}` : ""} ✓`,
    });
    setInputValue("");
  }, [inputValue, item, malId, totalChapters, mangaTitle, updateProgress, toast]);

  if (!user || !item) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
      {/* Progress Summary */}
      <div className="flex items-center gap-2 mb-3">
        <CheckCheck className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {read}{totalChapters ? ` of ${totalChapters}` : ""} chapters ({percent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <Progress value={percent} className="h-2 mb-3" />

      {/* Chapter input */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          type="number"
          placeholder={`Current chapter (${read})`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSetChapter()}
          className="h-8 text-sm"
          min={0}
          max={totalChapters || undefined}
        />
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={handleSetChapter}
          disabled={!inputValue || updateProgress.isPending}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
