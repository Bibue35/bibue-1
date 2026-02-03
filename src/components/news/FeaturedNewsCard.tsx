import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { NewsArticle, formatNewsDate } from "@/lib/news";
import { cn } from "@/lib/utils";

interface FeaturedNewsCardProps {
  article: NewsArticle;
  size?: "large" | "medium";
  className?: string;
}

export function FeaturedNewsCard({ article, size = "medium", className }: FeaturedNewsCardProps) {
  const linkPath = article.relatedMedia
    ? `/${article.relatedMedia.type}/${article.relatedMedia.id}`
    : "#";

  return (
    <Link
      to={linkPath}
      className={cn(
        "group relative rounded-2xl overflow-hidden block",
        size === "large" ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/9]",
        className
      )}
    >
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      
      <div className={cn(
        "absolute bottom-0 left-0 right-0",
        size === "large" ? "p-6 md:p-8" : "p-6"
      )}>
        <span className={cn(
          "inline-block px-3 py-1 rounded-full liquid-glass-subtle text-primary mb-3",
          size === "large" ? "text-sm" : "text-xs"
        )}>
          {article.category}
        </span>
        
        <h2 className={cn(
          "font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2",
          size === "large" ? "text-2xl md:text-3xl" : "text-lg"
        )}>
          {article.title}
        </h2>
        
        <p className={cn(
          "text-muted-foreground mb-4 line-clamp-2",
          size === "large" ? "" : "text-sm"
        )}>
          {article.excerpt}
        </p>
        
        <div className={cn(
          "flex items-center gap-4 text-muted-foreground",
          size === "large" ? "text-sm" : "text-xs"
        )}>
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {article.author}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatNewsDate(article.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
