import { cn } from "@/lib/utils";

export type ViewMode = "carousel" | "grid" | "masonry";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { key: ViewMode; label: string }[] = [
  { key: "carousel", label: "Row" },
  { key: "grid", label: "Grid" },
];

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press",
            mode === m.key
              ? "filter-pill-active"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          )}
          aria-label={`${m.label} view`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
