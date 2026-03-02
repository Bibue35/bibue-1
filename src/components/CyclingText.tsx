import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CyclingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function CyclingText({ words, interval = 2500, className }: CyclingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 400);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={cn("inline-block relative overflow-hidden pb-1", className)}>
      <span
        className={cn(
          "inline-block transition-all duration-400 ease-in-out",
          isAnimating
            ? "opacity-0 translate-y-4 blur-sm"
            : "opacity-100 translate-y-0 blur-0"
        )}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}
