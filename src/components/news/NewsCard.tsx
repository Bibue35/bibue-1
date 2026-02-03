import { Link } from "react-router-dom";
import { NewsArticle, formatNewsDate } from "@/lib/news";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
  className?: string;
}

export function NewsCard({ article, index = 0, className }: NewsCardProps) {
  const linkPath = article.relatedMedia
    ? `/${article.relatedMedia.type}/${article.relatedMedia.id}`
    : "#";

  return (
    <Link
      to={linkPath}
      className={cn(
        "group liquid-glass rounded-2xl overflow-hidden hover-lift animate-fade-up block",
        className
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full liquid-glass-strong text-xs font-medium">
          {article.category}
        </span>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>{formatNewsDate(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}
