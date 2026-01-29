import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Genre {
  id: number;
  name: string;
}

const animeGenres: Genre[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 7, name: "Mystery" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 36, name: "Slice of Life" },
  { id: 30, name: "Sports" },
  { id: 37, name: "Supernatural" },
];

const mangaGenres: Genre[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 22, name: "Romance" },
  { id: 36, name: "Slice of Life" },
  { id: 41, name: "Isekai" },
  { id: 25, name: "Shoujo" },
  { id: 27, name: "Shounen" },
  { id: 42, name: "Josei" },
];

interface GenreSectionProps {
  type: "anime" | "manga";
  className?: string;
}

export function GenreSection({ type, className }: GenreSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const genres = type === "anime" ? animeGenres : mangaGenres;
  const basePath = type === "anime" ? "/anime" : "/manga";

  return (
    <section className={cn("", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between mb-6 cursor-pointer group">
            <div className="text-left">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-foreground/80 transition-colors">
                Browse by Genre
              </h2>
              <p className="font-jp text-sm text-muted-foreground mt-0.5">
                {type === "anime" ? "ジャンル別" : "ジャンル別漫画"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="text-sm">{isOpen ? "Hide" : "Show"} Genres</span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isOpen && "rotate-180"
                )} 
              />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                to={`${basePath}?genre=${genre.id}`}
                className="genre-pill group flex items-center justify-center py-3 text-center"
              >
                <span className="group-hover:text-foreground transition-colors">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
