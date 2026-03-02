import { Link, useLocation } from "react-router-dom";
import { Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SHOW_ON = ["/manga", "/originals", "/studio"];

export function FloatingReferralButton() {
  const location = useLocation();
  const { user } = useAuth();

  if (!SHOW_ON.some(p => location.pathname.startsWith(p))) return null;

  return (
    <Link
      to="/refer"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#7C3AED] text-white text-xs font-medium shadow-lg shadow-[#7C3AED]/25 hover:bg-[#7C3AED]/90 transition-all hover:scale-105 active:scale-95"
    >
      <Gift className="w-4 h-4" />
      <span className="hidden sm:inline">Refer & Earn</span>
      <span className="sm:hidden">Earn 🪙</span>
    </Link>
  );
}
