import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ThemeFlavor = "default" | "mocha" | "latte" | "frappe" | "macchiato" | "liquid-glass";

interface ThemeContextType {
  mode: string;
  flavor: ThemeFlavor;
  resolvedMode: "light" | "dark";
  setMode: (mode: string) => void;
  setFlavor: (flavor: ThemeFlavor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ALL_FLAVOR_CLASSES = [
  "theme-mocha",
  "theme-latte",
  "theme-frappe",
  "theme-macchiato",
  "theme-liquid-glass",
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [flavor, setFlavorState] = useState<ThemeFlavor>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem("theme-flavor") as ThemeFlavor) || "default";
  });

  // Apply flavor classes to document (next-themes handles dark/light)
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all flavor classes
    ALL_FLAVOR_CLASSES.forEach(cls => root.classList.remove(cls));
    
    // Apply flavor
    if (flavor !== "default") {
      root.classList.add(`theme-${flavor}`);
    }
  }, [flavor]);

  const setMode = (newMode: string) => {
    setTheme(newMode);
  };

  const setFlavor = (newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    localStorage.setItem("theme-flavor", newFlavor);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        mode: theme || "dark", 
        flavor, 
        resolvedMode: (resolvedTheme as "light" | "dark") || "dark", 
        setMode, 
        setFlavor 
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
