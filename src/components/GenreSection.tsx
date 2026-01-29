import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Genre {
  id: number;
  name: string;
  icon?: string;
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
  const genres = type === "anime" ? animeGenres : mangaGenres;
  const basePath = type === "anime" ? "/anime" : "/manga";

  return (
    <section className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Browse by Genre</h2>
        <p className="font-jp text-sm text-muted-foreground mt-0.5">
          {type === "anime" ? "ジャンル別" : "ジャンル別漫画"}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            to={`${basePath}?genre=${genre.id}`}
            className="glass-button px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
