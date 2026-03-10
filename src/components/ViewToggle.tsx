import { cn } from "@/lib/utils";

export type ViewMode = "carousel" | "grid" | "masonry";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { key: ViewMode; label: string }[] = [
  { key: "carousel", label: "Row" },
  { key: "grid", label: "Grid" },
  { key: "masonry", label: "Free" },
];

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 text-[11px] font-medium tracking-wide uppercase">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={cn(
            "px-2.5 py-1 rounded-full transition-all duration-200",
            mode === m.key
              ? "bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`${m.label} view`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
