import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // Show iOS instruction banner after a delay
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }

    // Chrome/Android: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-4 left-3 right-3 z-50 mx-auto max-w-md",
        "bg-card border border-border/50 rounded-2xl p-4 shadow-2xl",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install Bibue</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap <Share className="w-3 h-3 inline mx-0.5" /> then "Add to Home Screen" for the best experience.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for quick access and an app-like experience.
            </p>
          )}
          {!isIOS && deferredPrompt && (
            <Button
              size="sm"
              variant="primary"
              className="mt-2.5 h-8 text-xs gap-1.5"
              onClick={handleInstall}
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
