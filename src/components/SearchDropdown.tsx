import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchDropdownProps {
  type: "anime" | "manga";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "default" | "large";
}

export function SearchDropdown({
  type,
  value,
  onChange,
  placeholder,
  size = "default",
}: SearchDropdownProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const isLarge = size === "large";

  return (
    <div className={cn("relative w-full mx-auto", isLarge ? "max-w-2xl" : "max-w-xl")}>
      <div
        className={cn(
          "flex items-center rounded-full border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-200",
          "focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 focus-within:shadow-lg",
          "shadow-sm",
          isLarge ? "px-7 py-1" : "px-5 py-0.5"
        )}
      >
        <Search className={cn(
          "text-muted-foreground shrink-0",
          isLarge ? "w-6 h-6" : "w-5 h-5"
        )} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || `Search ${type}...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex-1 bg-transparent placeholder:text-muted-foreground/60 focus:outline-none",
            isLarge ? "ml-4 h-14 text-lg" : "ml-3 h-12 text-base"
          )}
        />
        {value && (
          <button
            onClick={clearSearch}
            className="p-1.5 bg-muted/60 hover:bg-muted rounded-full transition-colors active:scale-95 shrink-0"
            aria-label="Clear search"
          >
            <X className={cn(isLarge ? "w-5 h-5" : "w-4 h-4")} />
          </button>
        )}
      </div>
    </div>
  );
}
