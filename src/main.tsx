import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// Prevent flash by setting theme immediately before React hydration
const storedTheme = localStorage.getItem("bibue-theme");
if (storedTheme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(storedTheme === "dark" ? "dark" : "light");
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    themes={["light", "dark"]}
    enableSystem={false}
    disableTransitionOnChange={false}
    storageKey="bibue-theme"
  >
    <App />
  </ThemeProvider>
);