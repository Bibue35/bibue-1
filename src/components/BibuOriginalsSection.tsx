import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";

const PLACEHOLDER_ORIGINALS = [
  {
    id: "orig-1",
    title: "Phantom Blade",
    genre: "Action",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    creator: "Riku Hoshino",
  },
  {
    id: "orig-2",
    title: "Moonlit Garden",
    genre: "Romance",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    creator: "Yuki Tanaka",
  },
  {
    id: "orig-3",
    title: "Iron Dynasty",
    genre: "Fantasy",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=450&fit=crop",
    creator: "Kai Chen",
  },
  {
    id: "orig-4",
    title: "Neon Shinobi",
    genre: "Sci-Fi",
    cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300&h=450&fit=crop",
    creator: "Mira Sato",
  },
  {
    id: "orig-5",
    title: "Crimson Oath",
    genre: "Thriller",
    cover: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=450&fit=crop",
    creator: "Daisuke Ono",
  },
];

export function BibuOriginalsSection() {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl sm:text-2xl font-bold">Bibue Originals</h2>
        </div>
        <Link
          to="/originals"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {PLACEHOLDER_ORIGINALS.map((item) => (
          <Link
            key={item.id}
            to="/originals"
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted mb-2">
              <img
                src={item.cover}
                alt={`${item.title} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Gold badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/90 text-black text-[10px] font-bold">
                <Crown className="w-3 h-3" />
                ORIGINAL
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.genre} · by {item.creator}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
