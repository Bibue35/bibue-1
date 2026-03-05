import { Link } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { genreDefinitions } from "@/data/watchOrderGuides";

const GenresPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
       <SEO
        title="Browse Manga by Genre"
        description="Explore manga, manhwa & manhua by genre. Find the best action, romance, comedy, thriller, horror, isekai, and more series."
        url="/genres"
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse by Genre</h1>
          <p className="text-muted-foreground text-sm">
            Discover the best manga, manhwa & manhua across every genre — from heart-pounding action to heartwarming romance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {genreDefinitions.map((genre) => (
            <Link
              key={genre.slug}
              to={`/genre/${genre.slug}`}
              className="group block rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">{genre.name}</div>
              <h2 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                {genre.name}
              </h2>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {genre.description.slice(0, 80)}...
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GenresPage;
