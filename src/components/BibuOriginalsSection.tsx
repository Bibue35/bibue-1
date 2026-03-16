import { Link } from "react-router-dom";
import { Crown, ArrowRight, Sparkles } from "lucide-react";

export function BibuOriginalsSection() {
  return (
    <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Bibue Originals</h2>
        </div>
        <Link
          to="/originals"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Learn More <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Original manga, manhwa & manhua by independent creators — launching soon on Bibue.
          </p>
          <Link
            to="/originals"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Explore Originals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
