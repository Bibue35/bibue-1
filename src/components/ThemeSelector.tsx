import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useThemeContext, ThemeFlavor } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

interface ThemeOption {
  id: string;
  label: string;
  flavor: ThemeFlavor;
  mode: "light" | "dark";
  preview: { bg: string; fg: string; accent: string };
}

const themes: ThemeOption[] = [
  { id: "moonlight", label: "Moonlight", flavor: "celestial", mode: "dark", preview: { bg: "#050505", fg: "#F7F7F7", accent: "#E5A100" } },
  { id: "sunlight", label: "Sunlight", flavor: "celestial", mode: "light", preview: { bg: "#F5EDDF", fg: "#1A1610", accent: "#E5A100" } },
  { id: "monochrome", label: "Mono", flavor: "monochrome", mode: "dark", preview: { bg: "#000000", fg: "#E6E6E6", accent: "#E6E6E6" } },
  { id: "contrast", label: "Contrast", flavor: "contrast", mode: "light", preview: { bg: "#FFFFFF", fg: "#000000", accent: "#000000" } },
];

function getCurrentThemeId(flavor: string, resolvedMode: string): string {
  const match = themes.find(t => t.flavor === flavor && t.mode === resolvedMode);
  if (match) return match.id;
  const flavorMatch = themes.find(t => t.flavor === flavor);
  if (flavorMatch) return flavorMatch.id;
  return resolvedMode === "dark" ? "moonlight" : "sunlight";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { flavor, resolvedMode, setMode, setFlavor } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const currentId = getCurrentThemeId(flavor, resolvedMode);

  const applyTheme = useCallback(
    (t: ThemeOption) => {
      setFlavor(t.flavor);
      setMode(t.mode);
      setOpen(false);
      setExpanded(false);
    },
    [setMode, setFlavor]
  );

  const currentTheme = themes.find((t) => t.id === currentId);
  const currentLabel = currentTheme?.label ?? "Theme";

  // Mobile: inline expand (no Popover — avoids transform/z-index issues)
  if (variant === "text") {
    return (
      <div className="py-4 border-b border-border/10">
        <div className="flex gap-2">
          {themes.map((t) => {
            const active = currentId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => applyTheme(t)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-200",
                  active
                    ? "bg-foreground/10 ring-1 ring-foreground/20"
                    : "hover:bg-foreground/5"
                )}
              >
                <div
                  className="w-full aspect-[3/2] rounded-lg overflow-hidden flex items-end p-1"
                  style={{ background: t.preview.bg }}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2 h-0.5 rounded-full" style={{ background: t.preview.accent }} />
                    <div className="w-3 h-0.5 rounded-full" style={{ background: t.preview.fg, opacity: 0.3 }} />
                  </div>
                </div>
                <span className={cn(
                  "text-[9px] font-medium tracking-wide",
                  active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 btn-press"
          aria-label="Change theme"
        >
          Theme
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3" sideOffset={8}>
        <ThemeGrid currentId={currentId} onSelect={applyTheme} />
      </PopoverContent>
    </Popover>
  );
}

function ThemeGrid({ currentId, onSelect }: { currentId: string; onSelect: (t: ThemeOption) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((t) => {
        const active = currentId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200",
              active
                ? "ring-2 ring-foreground/30 bg-foreground/5"
                : "hover:bg-foreground/5"
            )}
          >
            <div
              className="w-full aspect-[3/2] rounded-lg overflow-hidden flex items-end p-1.5"
              style={{ background: t.preview.bg }}
            >
              <div className="flex gap-1">
                <div className="w-3 h-1 rounded-full" style={{ background: t.preview.accent }} />
                <div className="w-5 h-1 rounded-full" style={{ background: t.preview.fg, opacity: 0.3 }} />
              </div>
            </div>
            <span className="text-[10px] font-medium text-foreground/70">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
