import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENRES = [
  "Action", "Romance", "Fantasy", "Comedy", "Horror", "Drama", "Sci-Fi",
  "Mystery", "Slice of Life", "Adventure", "Thriller", "Sports",
  "Supernatural", "Psychological", "Isekai", "Martial Arts", "Mecha",
  "Historical", "Music", "Ecchi", "Shounen", "Shoujo", "Seinen", "Josei",
  "Harem", "Reverse Harem", "School", "Military", "Demons", "Magic",
  "Vampire", "Cultivation", "Regression", "Villainess", "Reincarnation",
  "Murim", "System", "Overpowered MC", "Solo Leveling-type", "Tower",
];

const FORMATS = [
  { label: "Manga", tag: "JP" },
  { label: "Manhwa", tag: "KR" },
  { label: "Manhua", tag: "CN" },
];

const STATUSES = [
  { label: "Ongoing", color: "bg-green-500" },
  { label: "Completed", color: "bg-blue-500" },
  { label: "Hiatus", color: "bg-yellow-500" },
];

export function HeroGenrePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-flex flex-col items-start">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5"
      >
        Explore Genres
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </Button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-5 space-y-4 max-w-xl">
            {/* Format & Status row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {FORMATS.map((f) => (
                <Link
                  key={f.label}
                  to={`/manga?type=${f.label.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-[10px] font-mono opacity-60">{f.tag}</span> {f.label}
                </Link>
              ))}
              <span className="w-px h-4 bg-border/50 mx-1" />
              {STATUSES.map((s) => (
                <Link
                  key={s.label}
                  to={`/manga?status=${s.label.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
                  {s.label}
                </Link>
              ))}
            </div>

            {/* Genre cloud */}
            <div className="flex flex-wrap gap-1">
              {GENRES.map((genre) => (
                <Link
                  key={genre}
                  to={`/genres/${genre.toLowerCase().replace(/[\s-]+/g, "-")}`}
                  className="px-2 py-0.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
