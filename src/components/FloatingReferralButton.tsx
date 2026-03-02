import { Link, useLocation } from "react-router-dom";
import { Crown } from "lucide-react";

export function FloatingReferralButton() {
  const location = useLocation();

  // Show on most pages except the refer page itself
  if (location.pathname === "/refer") return null;

  return (
    <Link
      to="/refer"
      className="fixed bottom-20 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 backdrop-blur-sm border border-border/30 text-muted-foreground text-[10px] font-medium shadow-sm hover:bg-foreground/15 hover:text-foreground transition-all hover:scale-105 active:scale-95"
    >
      <Crown className="w-3 h-3" />
      <span className="hidden sm:inline">Founder Crew</span>
      <span className="sm:hidden">Crew</span>
    </Link>
  );
}
