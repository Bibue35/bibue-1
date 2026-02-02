import { useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchDropdownProps {
  type: "anime" | "manga";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchDropdown({
  type,
  value,
  onChange,
  placeholder,
}: SearchDropdownProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="liquid-glass-strong rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || `Search ${type}...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-14 pl-14 pr-14 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus:outline-none rounded-2xl"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-1.5 bg-muted/60 hover:bg-muted rounded-full transition-colors active:scale-95"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
