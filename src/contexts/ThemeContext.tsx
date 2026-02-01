import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeFlavor = "default" | "mocha" | "latte" | "frappe" | "macchiato";

interface ThemeContextType {
  mode: ThemeMode;
  flavor: ThemeFlavor;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setFlavor: (flavor: ThemeFlavor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme-mode") as ThemeMode) || "system";
  });
  
  const [flavor, setFlavorState] = useState<ThemeFlavor>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem("theme-flavor") as ThemeFlavor) || "default";
  });

  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(() => {
    if (mode === "system") return getSystemTheme();
    return mode;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (mode === "system") {
        setResolvedMode(getSystemTheme());
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  // Update resolved mode when mode changes
  useEffect(() => {
    if (mode === "system") {
      setResolvedMode(getSystemTheme());
    } else {
      setResolvedMode(mode);
    }
  }, [mode]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("dark", "light");
    root.classList.remove("theme-mocha", "theme-latte", "theme-frappe", "theme-macchiato");
    
    // Apply mode
    if (resolvedMode === "dark") {
      root.classList.add("dark");
    }
    
    // Apply flavor
    if (flavor !== "default") {
      root.classList.add(`theme-${flavor}`);
    }
  }, [resolvedMode, flavor]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const setFlavor = (newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    localStorage.setItem("theme-flavor", newFlavor);
  };

  return (
    <ThemeContext.Provider value={{ mode, flavor, resolvedMode, setMode, setFlavor }}>
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
