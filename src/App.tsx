import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { IncognitoProvider } from "@/contexts/IncognitoContext";
import { MiniPlayerProvider } from "@/contexts/MiniPlayerContext";
import { IncognitoOverlay } from "@/components/IncognitoOverlay";
import { MiniPlayer } from "@/components/MiniPlayer";
import { MessageNotificationProvider } from "@/components/MessageNotificationProvider";
import Index from "./pages/Index";
import AnimePage from "./pages/AnimePage";
import MangaPage from "./pages/MangaPage";
import AnimeDetail from "./pages/AnimeDetail";
import MangaDetail from "./pages/MangaDetail";
import Rankings from "./pages/Rankings";
import NewsPage from "./pages/NewsPage";
import CommunityPage from "./pages/CommunityPage";
import UserProfile from "./pages/UserProfile";
import WatchlistPage from "./pages/WatchlistPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ClassicsPage from "./pages/ClassicsPage";
import SettingsPage from "./pages/SettingsPage";
import MessagesPage from "./pages/MessagesPage";
import AdminPage from "./pages/AdminPage";
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
        <IncognitoProvider>
          <MiniPlayerProvider>
            <TooltipProvider>
              <IncognitoOverlay />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <MessageNotificationProvider>
                  <MiniPlayer />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/anime" element={<AnimePage />} />
                    <Route path="/anime/:id" element={<AnimeDetail />} />
                    <Route path="/manga" element={<MangaPage />} />
                    <Route path="/manga/:id" element={<MangaDetail />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/user/:userId" element={<UserProfile />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/messages/:partnerId" element={<MessagesPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/classics" element={<ClassicsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MessageNotificationProvider>
              </BrowserRouter>
            </TooltipProvider>
          </MiniPlayerProvider>
        </IncognitoProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
