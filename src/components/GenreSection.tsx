import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles, Flame, Heart, Skull, Wand2, Swords, Ghost, Mountain, Laugh, Rocket, Drama, Leaf } from "lucide-react";

interface Genre {
  id: number;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

const animeGenres: Genre[] = [
  { id: 1, name: "Action", icon: <Swords className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 2, name: "Adventure", icon: <Mountain className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 4, name: "Comedy", icon: <Laugh className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 8, name: "Drama", icon: <Drama className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 10, name: "Fantasy", icon: <Wand2 className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 14, name: "Horror", icon: <Skull className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 7, name: "Mystery", icon: <Ghost className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 22, name: "Romance", icon: <Heart className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 24, name: "Sci-Fi", icon: <Rocket className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 36, name: "Slice of Life", icon: <Leaf className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 30, name: "Sports", icon: <Flame className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 37, name: "Supernatural", icon: <Sparkles className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
];

const mangaGenres: Genre[] = [
  { id: 1, name: "Action", icon: <Swords className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 2, name: "Adventure", icon: <Mountain className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 4, name: "Comedy", icon: <Laugh className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 8, name: "Drama", icon: <Drama className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 10, name: "Fantasy", icon: <Wand2 className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 14, name: "Horror", icon: <Skull className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 22, name: "Romance", icon: <Heart className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 36, name: "Slice of Life", icon: <Leaf className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 41, name: "Isekai", icon: <Sparkles className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 25, name: "Shoujo", icon: <Heart className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 27, name: "Shounen", icon: <Flame className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
  { id: 42, name: "Josei", icon: <Drama className="w-4 h-4" />, gradient: "from-accent/50 to-accent/20" },
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            to={`${basePath}?genre=${genre.id}`}
            className={cn(
              "genre-pill group flex items-center justify-center gap-2 py-3",
              "bg-gradient-to-br",
              genre.gradient
            )}
          >
            <span className="opacity-70 group-hover:opacity-100 transition-opacity">
              {genre.icon}
            </span>
            <span>{genre.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
