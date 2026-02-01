import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, X, Star, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Anime, Manga } from "@/lib/api";

interface SearchDropdownProps {
  type: "anime" | "manga";
  value: string;
  onChange: (value: string) => void;
  results: Anime[] | Manga[] | undefined;
  isLoading: boolean;
  placeholder?: string;
  onSelectItem?: (item: Anime | Manga) => void;
}

export function SearchDropdown({
  type,
  value,
  onChange,
  results,
  isLoading,
  placeholder,
  onSelectItem,
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasResults = results && results.length > 0;
  const showDropdown = isOpen && value.length > 0 && (hasResults || isLoading);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !results) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const selected = results[focusedIndex];
      if (onSelectItem) {
        onSelectItem(selected);
      }
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getImageUrl = (item: Anime | Manga) => {
    return item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url;
  };

  const getDetailUrl = (item: Anime | Manga) => {
    return `/${type}/${item.mal_id}`;
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="liquid-glass-strong rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder || `Search ${type}...`}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
              setFocusedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-14 pl-14 pr-14 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus:outline-none rounded-2xl"
          />
          {value && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : hasResults ? (
            <div className="max-h-[400px] overflow-y-auto">
              {results.slice(0, 8).map((item, index) => (
                <Link
                  key={item.mal_id}
                  to={getDetailUrl(item)}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors",
                    focusedIndex === index && "bg-muted/50"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={getImageUrl(item)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.title_japanese && (
                      <p className="text-xs text-muted-foreground font-jp truncate">
                        {item.title_japanese}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.score && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          {item.score.toFixed(1)}
                        </span>
                      )}
                      {type === "anime" && (item as Anime).episodes && (
                        <span className="text-xs text-muted-foreground">
                          {(item as Anime).episodes} eps
                        </span>
                      )}
                      {type === "manga" && (item as Manga).chapters && (
                        <span className="text-xs text-muted-foreground">
                          {(item as Manga).chapters} ch
                        </span>
                      )}
                      {item.status && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.status.toLowerCase().replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* View all results hint */}
              {results.length > 8 && (
                <div className="p-3 text-center border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    +{results.length - 8} more results below
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
