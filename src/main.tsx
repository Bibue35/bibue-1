import { createRoot } from "react-dom/client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { IncognitoProvider } from "./contexts/IncognitoContext";
import App from "./App.tsx";
import "./index.css";

// Prevent flash by setting theme immediately before React hydration
const storedMode = localStorage.getItem("theme-mode");
const storedFlavor = localStorage.getItem("theme-flavor");

if (storedMode) {
  document.documentElement.classList.remove("light", "dark");
  if (storedMode === "dark" || (storedMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
}

if (storedFlavor && storedFlavor !== "default") {
  document.documentElement.classList.add(`theme-${storedFlavor}`);
}

createRoot(document.getElementById("root")!).render(
  <NextThemesProvider
    attribute="class"
    defaultTheme="dark"
    themes={["light", "dark"]}
    enableSystem={false}
    disableTransitionOnChange={false}
    storageKey="bibue-theme"
  >
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </NextThemesProvider>
);