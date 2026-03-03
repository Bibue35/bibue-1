import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { IncognitoProvider } from "@/contexts/IncognitoContext";
import { SpoilerFreeProvider } from "@/contexts/SpoilerFreeContext";
import { MiniPlayerProvider } from "@/contexts/MiniPlayerContext";
import { IncognitoOverlay } from "@/components/IncognitoOverlay";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load non-critical shell components
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const OfflineBanner = lazy(() => import("@/components/OfflineBanner").then(m => ({ default: m.OfflineBanner })));


// Lazy load non-critical global components
const MiniPlayer = lazy(() => import("@/components/MiniPlayer").then(m => ({ default: m.MiniPlayer })));
const MessageNotificationProvider = lazy(() => import("@/components/MessageNotificationProvider").then(m => ({ default: m.MessageNotificationProvider })));
const CreatorWelcomeModal = lazy(() => import("@/components/CreatorWelcomeModal").then(m => ({ default: m.CreatorWelcomeModal })));
const PWAInstallPrompt = lazy(() => import("@/components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const FloatingUploadButton = lazy(() => import("@/components/FloatingUploadButton").then(m => ({ default: m.FloatingUploadButton })));
const FloatingReferralButton = lazy(() => import("@/components/FloatingReferralButton").then(m => ({ default: m.FloatingReferralButton })));
const ContextualBottomStrip = lazy(() => import("@/components/ContextualBottomStrip").then(m => ({ default: m.ContextualBottomStrip })));

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const MangaPage = lazy(() => import("./pages/MangaPage"));
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
const RankingsPage = lazy(() => import("./pages/Rankings"));
const WatchPartyPage = lazy(() => import("./pages/WatchPartyPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const ForCreatorsPage = lazy(() => import("./pages/ForCreatorsPage"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const OriginalsPage = lazy(() => import("./pages/OriginalsPage"));
const OriginalSeriesDetail = lazy(() => import("./pages/OriginalSeriesDetail"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const ReferAndEarnPage = lazy(() => import("./pages/ReferAndEarnPage"));

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

// Redirect /anime/:id to /manga/:id preserving the ID
function AnimeRedirect() {
  const { id } = useParams();
  return <Navigate to={`/manga/${id}`} replace />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <IncognitoProvider>
            <SpoilerFreeProvider>
            <MiniPlayerProvider>
              <TooltipProvider>
                <Suspense fallback={null}><OfflineBanner /></Suspense>
                <IncognitoOverlay />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <Suspense fallback={null}>
                    <MessageNotificationProvider>
                      <MiniPlayer />
                      <BackToTop />
                      <ContextualBottomStrip />
                      <CreatorWelcomeModal />
                      <PWAInstallPrompt />
                      <FloatingUploadButton />
                      <FloatingReferralButton />
                    </MessageNotificationProvider>
                  </Suspense>
                  <Suspense fallback={<PageLoader />}>
                    <SwipeNavigationWrapper>
                      <AnimatedRoutes>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/anime" element={<Navigate to="/manga" replace />} />
                          <Route path="/anime/:id" element={<AnimeRedirect />} />
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
                          <Route path="/rankings" element={<RankingsPage />} />
                          <Route path="/party/:code" element={<WatchPartyPage />} />
                          <Route path="/compare" element={<ComparePage />} />
                          <Route path="/seek" element={<Navigate to="/manga" replace />} />
                          <Route path="/for-creators" element={<ForCreatorsPage />} />
                          <Route path="/originals" element={<OriginalsPage />} />
                          <Route path="/originals/:id" element={<OriginalSeriesDetail />} />
                          <Route path="/studio" element={<StudioPage />} />
                          <Route path="/refer" element={<ReferAndEarnPage />} />
                          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                          <Route path="/creator/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                          <Route path="/creator/:identifier" element={<CreatorProfile />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AnimatedRoutes>
                    </SwipeNavigationWrapper>
                  </Suspense>
                  
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
