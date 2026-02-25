import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { IncognitoProvider } from "@/contexts/IncognitoContext";
import { SpoilerFreeProvider } from "@/contexts/SpoilerFreeContext";
import { MiniPlayerProvider } from "@/contexts/MiniPlayerContext";
import { IncognitoOverlay } from "@/components/IncognitoOverlay";
import { MiniPlayer } from "@/components/MiniPlayer";
import { MessageNotificationProvider } from "@/components/MessageNotificationProvider";
import { CreatorWelcomeModal } from "@/components/CreatorWelcomeModal";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/BackToTop";
import { ContextualBottomStrip } from "@/components/ContextualBottomStrip";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const AnimePage = lazy(() => import("./pages/AnimePage"));
const MangaPage = lazy(() => import("./pages/MangaPage"));
const AnimeDetail = lazy(() => import("./pages/AnimeDetail"));
const MangaDetail = lazy(() => import("./pages/MangaDetail"));
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
const SeasonalPage = lazy(() => import("./pages/SeasonalPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const GuidesPage = lazy(() => import("./pages/GuidesPage"));
const GuideDetailPage = lazy(() => import("./pages/GuideDetailPage"));
const GenresPage = lazy(() => import("./pages/GenresPage"));
const GenreDetailPage = lazy(() => import("./pages/GenreDetailPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AnimeMapPage = lazy(() => import("./pages/AnimeMapPage"));
const VibeCheckPage = lazy(() => import("./pages/NotFound"));
const RankingsPage = lazy(() => import("./pages/Rankings"));
const WatchPartyPage = lazy(() => import("./pages/WatchPartyPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const SeekPage = lazy(() => import("./pages/SeekPage"));
const ForCreatorsPage = lazy(() => import("./pages/ForCreatorsPage"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const OriginalsPage = lazy(() => import("./pages/OriginalsPage"));

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
      staleTime: 5 * 60 * 1000,       // 5 min before refetch
      gcTime: 60 * 60 * 1000,          // keep in cache 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <IncognitoProvider>
            <SpoilerFreeProvider>
            <MiniPlayerProvider>
              <TooltipProvider>
                <OfflineBanner />
                <IncognitoOverlay />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <MessageNotificationProvider>
                    <MiniPlayer />
                    <BackToTop />
                    <ContextualBottomStrip />
                    <CreatorWelcomeModal />
                    <Suspense fallback={<PageLoader />}>
                      <SwipeNavigationWrapper>
                        <AnimatedRoutes>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/anime" element={<AnimePage />} />
                            <Route path="/anime/:id" element={<AnimeDetail />} />
                            <Route path="/manga" element={<MangaPage />} />
                            <Route path="/manga/:id" element={<MangaDetail />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/community" element={<CommunityPage />} />
                            <Route path="/user/:userId" element={<UserProfile />} />
                            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                            <Route path="/messages/:partnerId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                            <Route path="/recommendations" element={<RecommendationsPage />} />
                            <Route path="/classics" element={<ClassicsPage />} />
                            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                            <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                            <Route path="/seasonal" element={<SeasonalPage />} />
                            <Route path="/seasonal/:seasonParam" element={<SeasonalPage />} />
                            <Route path="/schedule" element={<SchedulePage />} />
                            <Route path="/guides" element={<GuidesPage />} />
                            <Route path="/guide/:slug" element={<GuideDetailPage />} />
                            <Route path="/genres" element={<GenresPage />} />
                            <Route path="/genre/:genre" element={<GenreDetailPage />} />
                            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                            <Route path="/privacy" element={<PrivacyPage />} />
                            <Route path="/terms" element={<TermsPage />} />
                            <Route path="/map" element={<ProtectedRoute><AnimeMapPage /></ProtectedRoute>} />
                            <Route path="/galaxy" element={<ProtectedRoute><AnimeMapPage /></ProtectedRoute>} />
                            <Route path="/rankings" element={<RankingsPage />} />
                            <Route path="/party/:code" element={<WatchPartyPage />} />
                            <Route path="/compare" element={<ComparePage />} />
                            <Route path="/seek" element={<SeekPage />} />
                            <Route path="/for-creators" element={<ForCreatorsPage />} />
                            <Route path="/originals" element={<OriginalsPage />} />
                            <Route path="/originals/:id" element={<OriginalsPage />} />
                            <Route path="/creator/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </AnimatedRoutes>
                      </SwipeNavigationWrapper>
                    </Suspense>
                  </MessageNotificationProvider>
                </BrowserRouter>
              </TooltipProvider>
            </MiniPlayerProvider>
            </SpoilerFreeProvider>
          </IncognitoProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
