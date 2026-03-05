import { Button } from "@/components/ui/button";
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
  preview: { bg: string; fg: string; card: string; cardFg: string };
}

const themes: ThemeOption[] = [
  {
    id: "moonlight",
    label: "Moonlight",
    flavor: "celestial",
    mode: "dark",
    preview: { bg: "#000000", fg: "#F7F7F7", card: "#111111", cardFg: "#F7F7F7" },
  },
  {
    id: "sunlight",
    label: "Sunlight",
    flavor: "celestial",
    mode: "light",
    preview: { bg: "#FAFAFA", fg: "#0A0A0A", card: "#FFFFFF", cardFg: "#0A0A0A" },
  },
  {
    id: "monochrome",
    label: "Mono",
    flavor: "monochrome",
    mode: "dark",
    preview: { bg: "#000000", fg: "#F7F7F7", card: "#000000", cardFg: "#F7F7F7" },
  },
  {
    id: "contrast",
    label: "Contrast",
    flavor: "contrast",
    mode: "light",
    preview: { bg: "#FFFFFF", fg: "#000000", card: "#0D0D0D", cardFg: "#F7F7F7" },
  },
];

function getCurrentThemeId(flavor: string, resolvedMode: string): string {
  if (flavor === "monochrome") return "monochrome";
  if (flavor === "contrast") return "contrast";
  return resolvedMode === "dark" ? "moonlight" : "sunlight";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { flavor, resolvedMode, setMode, setFlavor } = useThemeContext();
  const [open, setOpen] = useState(false);
  const currentId = getCurrentThemeId(flavor, resolvedMode);

  const applyTheme = useCallback(
    (t: ThemeOption) => {
      setFlavor(t.flavor);
      setMode(t.mode);
      setOpen(false);
    },
    [setMode, setFlavor]
  );

  const currentLabel = themes.find((t) => t.id === currentId)?.label ?? "Theme";

  if (variant === "text") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
              "hover:bg-foreground/5 text-muted-foreground"
            )}
          >
            {currentLabel}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2" sideOffset={4}>
          <ThemeGrid currentId={currentId} onSelect={applyTheme} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-foreground/5 transition-all group btn-press"
          aria-label="Change theme"
        >
          {/* Mini preview dot of current theme */}
          <div
            className="w-5 h-5 rounded-full border-2 border-foreground/20"
            style={{ background: themes.find((t) => t.id === currentId)?.preview.bg }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2" sideOffset={8}>
        <ThemeGrid currentId={currentId} onSelect={applyTheme} />
      </PopoverContent>
    </Popover>
  );
}

function ThemeGrid({
  currentId,
  onSelect,
}: {
  currentId: string;
  onSelect: (t: ThemeOption) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((t) => {
        const active = currentId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-150",
              active
                ? "ring-2 ring-foreground/30 bg-foreground/5"
                : "hover:bg-foreground/5"
            )}
          >
            {/* Theme preview card */}
            <div
              className="w-full aspect-[4/3] rounded-lg border border-border/40 overflow-hidden flex flex-col"
              style={{ background: t.preview.bg }}
            >
              {/* Mock header line */}
              <div className="flex items-center gap-1 p-1.5">
                <div className="w-4 h-1 rounded-full" style={{ background: t.preview.fg, opacity: 0.4 }} />
                <div className="w-6 h-1 rounded-full ml-auto" style={{ background: t.preview.fg, opacity: 0.2 }} />
              </div>
              {/* Mock card */}
              <div
                className="mx-1.5 mb-1.5 flex-1 rounded"
                style={{ background: t.preview.card }}
              >
                <div className="p-1.5 space-y-1">
                  <div className="w-3/4 h-1 rounded-full" style={{ background: t.preview.cardFg, opacity: 0.5 }} />
                  <div className="w-1/2 h-1 rounded-full" style={{ background: t.preview.cardFg, opacity: 0.3 }} />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground/70">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
