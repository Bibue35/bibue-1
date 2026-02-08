import { useLocation } from "react-router-dom";
import { useRef, useEffect, useState, memo } from "react";
import { cn } from "@/lib/utils";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

export const AnimatedRoutes = memo(function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setIsAnimating(true);

      // Remove animation class after it completes
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className={cn(
        "page-transition",
        isAnimating && "page-entering"
      )}
    >
      {children}
    </div>
  );
});
