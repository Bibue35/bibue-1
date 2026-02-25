import { Link, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";

export function FloatingHelpButton() {
  const location = useLocation();
  // Don't show on support page itself, admin, or reader
  if (location.pathname === "/support" || location.pathname === "/admin") return null;

  return (
    <Link
      to="/support"
      className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-neon-cyan flex items-center justify-center shadow-lg shadow-neon-cyan/30 hover:shadow-neon-cyan/50 hover:scale-110 transition-all duration-200"
      aria-label="Help & Support"
    >
      <HelpCircle className="w-5 h-5 text-[hsl(0,0%,4%)]" />
    </Link>
  );
}
