import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeContext, ThemeMode, ThemeFlavor } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const modes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
  { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
];

const flavors: { value: ThemeFlavor; label: string; colors: string[] }[] = [
  { value: "default", label: "Celestial", colors: ["#d4a574", "#5b8fb9"] },
  { value: "mocha", label: "Mocha", colors: ["#1e1e2e", "#cba6f7"] },
  { value: "latte", label: "Latte", colors: ["#eff1f5", "#8839ef"] },
  { value: "frappe", label: "Frappé", colors: ["#303446", "#ca9ee6"] },
  { value: "macchiato", label: "Macchiato", colors: ["#24273a", "#c6a0f6"] },
];

export function ThemeSelector() {
  const { mode, flavor, setMode, setFlavor, resolvedMode } = useThemeContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent transition-colors">
          {resolvedMode === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Mode Selection */}
        {modes.map((m) => (
          <DropdownMenuItem
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn("gap-2 cursor-pointer", mode === m.value && "bg-accent")}
          >
            {m.icon}
            <span>{m.label}</span>
            {mode === m.value && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Theme Flavor
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Flavor Selection */}
        {flavors.map((f) => (
          <DropdownMenuItem
            key={f.value}
            onClick={() => setFlavor(f.value)}
            className={cn("gap-2 cursor-pointer", flavor === f.value && "bg-accent")}
          >
            <div className="flex gap-0.5">
              {f.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border border-border/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span>{f.label}</span>
            {flavor === f.value && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
