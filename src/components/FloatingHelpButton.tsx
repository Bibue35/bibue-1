import { Link, useLocation } from "react-router-dom";
import bibueIcon from "@/assets/bibue-tower.png";

export function FloatingHelpButton() {
  const location = useLocation();
  if (location.pathname === "/support" || location.pathname === "/admin") return null;

  return (
    <Link
      to="/support"
      className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
      aria-label="Help & Support"
    >
      <img src={bibueIcon} alt="" className="w-6 h-6" loading="lazy" />
    </Link>
  );
}
