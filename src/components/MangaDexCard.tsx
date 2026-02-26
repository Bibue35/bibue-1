import { useState } from "react";
import { Star, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { MangaDetailModal } from "./MangaDetailModal";
import type { MangaDexSearchResult } from "@/hooks/useMangaDex";

interface MangaDexCardProps {
  manga: MangaDexSearchResult;
  index?: number;
  eager?: boolean;
  variant?: "default" | "compact";
}

export function MangaDexCard({ manga, index = 0, eager = false, variant = "default" }: MangaDexCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors w-full text-left group"
        >
          <span className="text-sm font-bold text-muted-foreground w-5 text-center shrink-0">
            {(index || 0) + 1}
          </span>
          <div className="w-10 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
            {manga.coverUrl ? (
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {manga.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {manga.status === 'completed' ? 'Completed' : manga.status === 'ongoing' ? 'Ongoing' : manga.status}
              {manga.year ? ` · ${manga.year}` : ''}
            </p>
          </div>
        </button>
        {/* We can't open MangaDetailModal with mangadex ID directly — link to search */}
      </>
    );
  }

  return (
    <button
      onClick={() => setModalOpen(false)} // No modal for MangaDex-only cards yet
      className={cn("block group text-left w-full")}
    >
      <div className={cn(
        "relative aspect-[2/3] rounded-2xl overflow-hidden mb-2",
        "divine-card sun-glow moon-glow"
      )}>
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={eager ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {manga.status && (
          <div className="absolute top-2 right-2 bg-background/80 text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {manga.status === 'completed' ? '✓' : manga.status === 'ongoing' ? '◉' : ''}
          </div>
        )}
      </div>
      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
        {manga.title}
      </h3>
    </button>
  );
}
