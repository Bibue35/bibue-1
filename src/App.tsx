import { Suspense, lazy } from "react";
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
import { CommunityButton } from "@/components/CommunityButton";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const AnimePage = lazy(() => import("./pages/AnimePage"));
const MangaPage = lazy(() => import("./pages/MangaPage"));
const AnimeDetail = lazy(() => import("./pages/AnimeDetail"));
const MangaDetail = lazy(() => import("./pages/MangaDetail"));
// Rankings page removed - rankings are now embedded in Anime/Manga pages
const NewsPage = lazy(() => import("./pages/NewsPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const ClassicsPage = lazy(() => import("./pages/ClassicsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Minimal loading fallback for route transitions
const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
                  {/* CommunityButton moved into navbar */}
                  <MiniPlayer />
                  <Suspense fallback={<PageLoader />}>
                    <SwipeNavigationWrapper>
                      <AnimatedRoutes>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/anime" element={<AnimePage />} />
                          <Route path="/anime/:id" element={<AnimeDetail />} />
                          <Route path="/manga" element={<MangaPage />} />
                          <Route path="/manga/:id" element={<MangaDetail />} />
                          {/* Rankings removed - embedded in anime/manga pages */}
                          <Route path="/news" element={<NewsPage />} />
                          <Route path="/community" element={<CommunityPage />} />
                          <Route path="/user/:userId" element={<UserProfile />} />
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route path="/messages/:partnerId" element={<MessagesPage />} />
                          <Route path="/watchlist" element={<WatchlistPage />} />
                          <Route path="/recommendations" element={<RecommendationsPage />} />
                          <Route path="/classics" element={<ClassicsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/stats" element={<StatsPage />} />
                          <Route path="/history" element={<HistoryPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AnimatedRoutes>
                    </SwipeNavigationWrapper>
                  </Suspense>
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
