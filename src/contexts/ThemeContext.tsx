import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ThemeFlavor = "default" | "mocha" | "latte" | "frappe" | "macchiato";
export type ThemeMode = "light" | "dark" | "system" | "ink" | "medieval";

interface ThemeContextType {
  mode: string;
  flavor: ThemeFlavor;
  resolvedMode: "light" | "dark" | "ink" | "medieval";
  setMode: (mode: string) => void;
  setFlavor: (flavor: ThemeFlavor) => void;
  isInk: boolean;
  isMedieval: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [specialTheme, setSpecialTheme] = useState<"none" | "ink" | "medieval">(() => {
    if (typeof window === "undefined") return "none";
    const stored = localStorage.getItem("theme-special");
    if (stored === "ink" || stored === "medieval") return stored;
    // Legacy support
    if (localStorage.getItem("theme-ink") === "true") return "ink";
    return "none";
  });

  const [flavor, setFlavorState] = useState<ThemeFlavor>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem("theme-flavor") as ThemeFlavor) || "default";
  });

  // Apply flavor and special theme classes
  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove("theme-mocha", "theme-latte", "theme-frappe", "theme-macchiato", "ink", "medieval");
    
    if (specialTheme === "ink") {
      root.classList.add("ink");
    } else if (specialTheme === "medieval") {
      root.classList.add("medieval");
    } else if (flavor !== "default") {
      root.classList.add(`theme-${flavor}`);
    }
  }, [flavor, specialTheme]);

  const setMode = (newMode: string) => {
    if (newMode === "ink" || newMode === "medieval") {
      setSpecialTheme(newMode);
      localStorage.setItem("theme-special", newMode);
      localStorage.setItem("theme-ink", newMode === "ink" ? "true" : "false");
      setTheme("light");
    } else {
      setSpecialTheme("none");
      localStorage.setItem("theme-special", "none");
      localStorage.setItem("theme-ink", "false");
      setTheme(newMode);
    }
  };

  const setFlavor = (newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    localStorage.setItem("theme-flavor", newFlavor);
  };

  const isInk = specialTheme === "ink";
  const isMedieval = specialTheme === "medieval";

  const resolvedMode: "light" | "dark" | "ink" | "medieval" = isInk 
    ? "ink" 
    : isMedieval 
      ? "medieval"
      : (resolvedTheme as "light" | "dark") || "dark";

  return (
    <ThemeContext.Provider 
      value={{ 
        mode: specialTheme !== "none" ? specialTheme : (theme || "dark"), 
        flavor, 
        resolvedMode,
        setMode, 
        setFlavor,
        isInk,
        isMedieval,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
