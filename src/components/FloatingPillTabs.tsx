import { memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Newspaper, Sparkles, Users, Grid3X3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const tabs = [
  { href: "/guides", icon: BookOpen, label: "Guides" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/recommendations", icon: Sparkles, label: "For You" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/genres", icon: Grid3X3, label: "Genres" },
];

// Inject keyframe once
const STYLE_ID = "floating-pill-keyframe";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `@keyframes floatPillIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(calc(100% - 40px))}}`;
  document.head.appendChild(style);
}

export const FloatingPillTabs = memo(function FloatingPillTabs() {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {tabs.map((tab, i) => (
        <Link
          key={tab.href}
          to={tab.href}
          className="group flex items-center gap-2.5 h-10 pl-3 pr-4 rounded-l-full bg-foreground/5 backdrop-blur-md shadow-lg border border-border/10 border-r-0 hover:!translate-x-0 hover:bg-primary/80 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            opacity: 0,
            transform: "translateX(100%)",
            animation: `floatPillIn 300ms ease-out ${i * 50 + 300}ms forwards`,
          }}
          aria-label={tab.label}
        >
          <tab.icon className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
          <span className="text-sm font-medium whitespace-nowrap text-muted-foreground group-hover:text-primary-foreground transition-colors">
            {tab.label}
          </span>
        </Link>
      ))}
    </div>
  );
});
