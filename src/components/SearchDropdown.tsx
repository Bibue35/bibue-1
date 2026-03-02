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
          "flex items-center rounded-[9999px] border border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300",
          "focus-within:border-foreground/20 focus-within:ring-4 focus-within:ring-foreground/5 focus-within:shadow-lg",
          "shadow-sm hover:shadow-md",
          isLarge ? "px-8 py-1.5" : "px-6 py-1"
        )}
      >
        <Search className={cn(
          "text-muted-foreground/60 shrink-0",
          isLarge ? "w-6 h-6" : "w-5 h-5"
        )} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || `Search ${type}...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex-1 bg-transparent placeholder:text-muted-foreground/50 focus:outline-none text-foreground",
            isLarge ? "ml-4 h-14 text-xl" : "ml-3 h-12 text-base"
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
