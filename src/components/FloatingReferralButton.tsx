import { Link, useLocation } from "react-router-dom";
import { Crown } from "lucide-react";

export function FloatingReferralButton() {
  const location = useLocation();

  // Show on most pages except the refer page itself
  if (location.pathname === "/refer") return null;

  return (
    <Link
      to="/refer"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(45,90%,50%)] text-white text-xs font-bold shadow-lg shadow-[hsl(270,70%,50%)]/30 hover:shadow-xl hover:shadow-[hsl(270,70%,50%)]/40 transition-all hover:scale-105 active:scale-95"
    >
      <Crown className="w-4 h-4" />
      <span className="hidden sm:inline">Join the Crew → Earn Launch Rewards</span>
      <span className="sm:hidden">Founder Crew 🔥</span>
    </Link>
  );
}
