import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import AnimePage from "./pages/AnimePage";
import MangaPage from "./pages/MangaPage";
import AnimeDetail from "./pages/AnimeDetail";
import MangaDetail from "./pages/MangaDetail";
import Rankings from "./pages/Rankings";
import NewsPage from "./pages/NewsPage";
import CommunityPage from "./pages/CommunityPage";
import WatchlistPage from "./pages/WatchlistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/anime/:id" element={<AnimeDetail />} />
              <Route path="/manga" element={<MangaPage />} />
              <Route path="/manga/:id" element={<MangaDetail />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
