import { createRoot } from "react-dom/client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";

// Prevent flash by setting flavor immediately before React hydration
const storedFlavor = localStorage.getItem("theme-flavor");

if (storedFlavor && storedFlavor !== "default") {
  document.documentElement.classList.add(`theme-${storedFlavor}`);
}

createRoot(document.getElementById("root")!).render(
  <NextThemesProvider
    attribute="class"
    defaultTheme="dark"
    themes={["light", "dark"]}
    enableSystem={false}
    disableTransitionOnChange
    storageKey="bibue-theme"
  >
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </NextThemesProvider>
);