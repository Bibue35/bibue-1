import { useLocation } from "react-router-dom";
import { useRef, useEffect, useState, memo } from "react";
import { cn } from "@/lib/utils";
import { consumeSwipeNavFlag } from "@/lib/swipeNavFlag";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

export const AnimatedRoutes = memo(function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      // If this navigation came from a swipe, skip the animation
      if (consumeSwipeNavFlag()) {
        return;
      }

      // Crossfade: exit (fade out) then enter (fade in)
      setPhase("exit");
      const exitTimer = setTimeout(() => {
        setPhase("enter");
        const enterTimer = setTimeout(() => setPhase("idle"), 300);
        return () => clearTimeout(enterTimer);
      }, 150);
      return () => clearTimeout(exitTimer);
    }
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "transition-opacity duration-300 ease-out",
        phase === "exit" && "opacity-0",
        phase === "enter" && "opacity-0 animate-crossfade-in",
        phase === "idle" && "opacity-100"
      )}
    >
      {children}
    </div>
  );
});
