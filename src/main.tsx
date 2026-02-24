import { createRoot } from "react-dom/client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";

// Prevent flash by setting flavor immediately before React hydration
const storedFlavor = localStorage.getItem("theme-flavor");
const storedInk = localStorage.getItem("theme-ink");

if (storedInk === "true") {
  document.documentElement.classList.add("ink");
} else if (storedFlavor && storedFlavor !== "default") {
  document.documentElement.classList.add(`theme-${storedFlavor}`);
}

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
      storageKey="bibue-theme"
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </NextThemesProvider>
  </HelmetProvider>
);