import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HorizontalScroll } from "./HorizontalScroll";

interface Category {
  id: string;
  label: string;
  type: "genre" | "collection";
  /** Genre ID for genre type, or filter param for collection type */
  param: string;
}

const animeCategories: Category[] = [
  // Curated collections first
  { id: "trending", label: "🔥 Trending", type: "collection", param: "filter=airing" },
  { id: "this-season", label: "📺 This Season", type: "collection", param: "filter=seasonal" },
  { id: "upcoming", label: "⏳ Coming Soon", type: "collection", param: "filter=upcoming" },
  { id: "popular", label: "⭐ Most Popular", type: "collection", param: "filter=bypopularity" },
  { id: "classics", label: "🏛️ Classics", type: "collection", param: "classics" },
  // Genres
  { id: "g-action", label: "Action", type: "genre", param: "1" },
  { id: "g-adventure", label: "Adventure", type: "genre", param: "2" },
  { id: "g-comedy", label: "Comedy", type: "genre", param: "4" },
  { id: "g-drama", label: "Drama", type: "genre", param: "8" },
  { id: "g-fantasy", label: "Fantasy", type: "genre", param: "10" },
  { id: "g-horror", label: "Horror", type: "genre", param: "14" },
  { id: "g-mystery", label: "Mystery", type: "genre", param: "7" },
  { id: "g-romance", label: "Romance", type: "genre", param: "22" },
  { id: "g-scifi", label: "Sci-Fi", type: "genre", param: "24" },
  { id: "g-sol", label: "Slice of Life", type: "genre", param: "36" },
  { id: "g-sports", label: "Sports", type: "genre", param: "30" },
  { id: "g-supernatural", label: "Supernatural", type: "genre", param: "37" },
  { id: "g-isekai", label: "Isekai", type: "genre", param: "41" },
  { id: "g-mecha", label: "Mecha", type: "genre", param: "18" },
  { id: "g-music", label: "Music", type: "genre", param: "19" },
  { id: "g-psychological", label: "Psychological", type: "genre", param: "40" },
];

const mangaCategories: Category[] = [
  // Genres
  { id: "g-action", label: "Action", type: "genre", param: "1" },
  { id: "g-adventure", label: "Adventure", type: "genre", param: "2" },
  { id: "g-comedy", label: "Comedy", type: "genre", param: "4" },
  { id: "g-drama", label: "Drama", type: "genre", param: "8" },
  { id: "g-fantasy", label: "Fantasy", type: "genre", param: "10" },
  { id: "g-horror", label: "Horror", type: "genre", param: "14" },
  { id: "g-romance", label: "Romance", type: "genre", param: "22" },
  { id: "g-sol", label: "Slice of Life", type: "genre", param: "36" },
  { id: "g-isekai", label: "Isekai", type: "genre", param: "41" },
  { id: "g-shoujo", label: "Shoujo", type: "genre", param: "25" },
  { id: "g-shounen", label: "Shounen", type: "genre", param: "27" },
  { id: "g-josei", label: "Josei", type: "genre", param: "42" },
  { id: "g-seinen", label: "Seinen", type: "genre", param: "28" },
  { id: "g-psychological", label: "Psychological", type: "genre", param: "40" },
  { id: "g-mystery", label: "Mystery", type: "genre", param: "7" },
  { id: "g-supernatural", label: "Supernatural", type: "genre", param: "37" },
];

interface CategoryBarProps {
  type: "anime" | "manga";
  className?: string;
}

export function CategoryBar({ type, className }: CategoryBarProps) {
  const [searchParams] = useSearchParams();
  const categories = type === "anime" ? animeCategories : mangaCategories;
  const basePath = type === "anime" ? "/anime" : "/manga";

  const currentGenre = searchParams.get("genre");
  const currentFilter = searchParams.get("filter");
  const currentSort = searchParams.get("sort");

  const isActive = (cat: Category) => {
    if (cat.type === "genre") {
      return currentGenre === cat.param;
    }
    // For collections, check if the current params match
    if (cat.id === "classics") return false; // separate page
    const params = new URLSearchParams(cat.param);
    const catFilter = params.get("filter");
    const catSort = params.get("sort");
    return currentFilter === catFilter && (catSort ? currentSort === catSort : !currentSort);
  };

  const getLink = (cat: Category) => {
    if (cat.type === "genre") {
      return `${basePath}?genre=${cat.param}`;
    }
    if (cat.id === "classics") return "/classics";
    return `${basePath}?${cat.param}`;
  };

  return (
    <div className={cn("", className)}>
      <HorizontalScroll showArrows={false}>
        <div className="flex items-center gap-2 px-1 py-1">
          {categories.map((cat) => {
            const active = isActive(cat);
            return (
              <Link
                key={cat.id}
                to={getLink(cat)}
                className={cn(
                  "flex-shrink-0 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "active:scale-95",
                  active
                    ? "bg-foreground/10 text-foreground"
                    : cat.type === "collection"
                      ? "bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </HorizontalScroll>
    </div>
  );
}
