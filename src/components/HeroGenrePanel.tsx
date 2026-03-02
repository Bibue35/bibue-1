import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENRES = [
  { label: "Action", emoji: "⚔️" },
  { label: "Romance", emoji: "💕" },
  { label: "Fantasy", emoji: "🧙" },
  { label: "Comedy", emoji: "😂" },
  { label: "Horror", emoji: "👻" },
  { label: "Drama", emoji: "🎭" },
  { label: "Sci-Fi", emoji: "🚀" },
  { label: "Mystery", emoji: "🔍" },
  { label: "Slice of Life", emoji: "🌸" },
  { label: "Adventure", emoji: "🗺️" },
  { label: "Thriller", emoji: "😱" },
  { label: "Sports", emoji: "⚽" },
  { label: "Supernatural", emoji: "👁️" },
  { label: "Psychological", emoji: "🧠" },
  { label: "Isekai", emoji: "🌀" },
  { label: "Martial Arts", emoji: "👊" },
];

const FORMATS = [
  { label: "Manga", flag: "🇯🇵" },
  { label: "Manhwa", flag: "🇰🇷" },
  { label: "Manhua", flag: "🇨🇳" },
];

const STATUSES = [
  { label: "Ongoing", color: "text-green-500" },
  { label: "Completed", color: "text-blue-500" },
  { label: "Hiatus", color: "text-yellow-500" },
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
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-5 space-y-4 max-w-lg">
            {/* Format */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Format</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map((f) => (
                  <Link
                    key={f.label}
                    to={`/manga?type=${f.label.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <span>{f.flag}</span> {f.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <Link
                    key={g.label}
                    to={`/genres/${g.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <span className="text-[10px]">{g.emoji}</span> {g.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <Link
                    key={s.label}
                    to={`/manga?status=${s.label.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-background/50 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.color.replace("text-", "bg-"))} />
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/genres"
              className="inline-flex text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
            >
              View all genres →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
