import { Signal, Layers, FileText, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function PremiumToolbar() {
  const { resolvedMode, setMode } = useThemeContext();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  const isDark = resolvedMode === "dark";

  const iconClass =
    "w-5 h-5 transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 cursor-pointer";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={cn(
          "flex items-center gap-6 h-12 px-6 rounded-3xl shadow-2xl toolbar-glass border border-border/30",
          isDark ? "bg-background/90" : "bg-card/90"
        )}
      >
        {/* Score badge */}
        <div className="group flex items-center justify-center w-9 h-9 rounded-xl ring-1 ring-amber-400/60 text-foreground font-semibold tracking-tighter text-sm cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_hsl(45,100%,50%,0.35)]">
          88
        </div>

        <Signal className={iconClass} />
        <Layers className={iconClass} />
        <FileText className={iconClass} />

        {/* Theme toggle */}
        <button
          onClick={() => setMode(isDark ? "light" : "dark")}
          className="focus:outline-none"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className={iconClass} />
          ) : (
            <Moon className={iconClass} />
          )}
        </button>
      </div>
    </div>
  );
}
