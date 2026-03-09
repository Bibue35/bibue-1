import { LayoutGrid, Rows3, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "carousel" | "grid" | "masonry";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border/30 p-0.5 bg-muted/30">
      <button
        onClick={() => onChange("carousel")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          mode === "carousel"
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Carousel view"
      >
        <Rows3 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          mode === "grid"
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onChange("masonry")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
          mode === "masonry"
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Masonry view"
      >
        <Columns3 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
