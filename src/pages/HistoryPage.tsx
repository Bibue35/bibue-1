import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Trash2, Play, BookOpen, ArrowLeft, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { history, isLoading, clearHistory, deleteEntry, isClearingHistory } =
    useViewingHistory(100);

  if (!user) {
    return (
      <>
        <CollapsibleNavbar />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">{t("history.title") || "Viewing History"}</h1>
            <p className="text-muted-foreground mb-6">
              {t("history.signInRequired") || "Sign in to track your viewing history"}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <CollapsibleNavbar />
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  {t("history.title") || "Viewing History"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {history.length} {t("history.items") || "items"}
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("history.clearAll") || "Clear All"}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("history.clearConfirmTitle") || "Clear Viewing History?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("history.clearConfirmDesc") ||
                        "This will permanently delete your entire viewing history. This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearHistory()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isClearingHistory}
                    >
                      {t("history.clearAll") || "Clear All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* History List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <History className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">
                {t("history.empty") || "No viewing history yet"}
              </p>
              <p className="text-sm mt-1">
                {t("history.emptyDesc") ||
                  "Anime and manga you view will appear here"}
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/anime">{t("history.browseAnime") || "Browse Anime"}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/${entry.media_type}/${entry.media_id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-md overflow-hidden bg-muted">
                      {entry.image_url ? (
                        <img
                          src={entry.image_url}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {entry.media_type === "anime" ? (
                            <Play className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/${entry.media_type}/${entry.media_id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-medium text-sm sm:text-base truncate">
                        {entry.title}
                      </h3>
                    </Link>
                    {entry.title_japanese && (
                      <p className="text-xs text-muted-foreground truncate font-jp">
                        {entry.title_japanese}
                      </p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase",
                          entry.media_type === "anime"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {entry.media_type}
                      </span>
                      {entry.last_episode && (
                        <span>
                          EP {entry.last_episode}
                        </span>
                      )}
                      {entry.last_chapter && (
                        <span>
                          CH {entry.last_chapter}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(entry.viewed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Resume button */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link to={`/${entry.media_type}/${entry.media_id}`}>
                        {entry.media_type === "anime" ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
