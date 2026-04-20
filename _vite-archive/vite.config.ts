import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssMinify: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-slot",
          ],
          "vendor-ui-popover": [
            "@radix-ui/react-popover",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
          ],
          "vendor-ui-extra": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-select",
            "@radix-ui/react-switch",
            "@radix-ui/react-checkbox",
          ],
          "vendor-charts": ["recharts"],
          "vendor-helmet": ["react-helmet-async"],
        },
      },
    },
  },
}));
