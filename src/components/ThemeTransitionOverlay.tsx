import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

type TransitionDirection = "to-sun" | "to-moon" | null;

interface ThemeTransitionOverlayProps {
  direction: TransitionDirection;
  onComplete: () => void;
}

export function ThemeTransitionOverlay({ direction, onComplete }: ThemeTransitionOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    if (!direction) return;
    setPhase("enter");

    const enterTimer = setTimeout(() => {
      setPhase("hold");
      const holdTimer = setTimeout(() => {
        setPhase("exit");
        const exitTimer = setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 600);
        return () => clearTimeout(exitTimer);
      }, 600);
      return () => clearTimeout(holdTimer);
    }, 800);

    return () => clearTimeout(enterTimer);
  }, [direction, onComplete]);

  if (!direction || phase === "done") return null;

  const isSun = direction === "to-sun";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Main gradient wash */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: phase === "enter" ? 1 : phase === "hold" ? 1 : 0,
          transitionDuration: phase === "exit" ? "600ms" : "800ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          background: isSun
            ? "linear-gradient(180deg, hsla(24,95%,53%,0.85) 0%, hsla(45,93%,58%,0.6) 40%, hsla(33,100%,96%,0.3) 100%)"
            : "linear-gradient(0deg, hsla(230,40%,8%,0.9) 0%, hsla(270,35%,18%,0.6) 40%, hsla(260,30%,30%,0.2) 100%)",
        }}
      />

      {/* Orb — sun or moon */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: "120px",
          height: "120px",
          top: isSun ? (phase === "enter" ? "-120px" : phase === "hold" ? "18%" : "18%") : undefined,
          bottom: !isSun ? (phase === "enter" ? "-120px" : phase === "hold" ? "20%" : "20%") : undefined,
          opacity: phase === "exit" ? 0 : 1,
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease",
          background: isSun
            ? "radial-gradient(circle, hsla(45,100%,70%,1) 0%, hsla(24,95%,53%,0.8) 60%, transparent 100%)"
            : "radial-gradient(circle, hsla(214,40%,90%,0.95) 0%, hsla(230,30%,75%,0.6) 55%, transparent 100%)",
          boxShadow: isSun
            ? "0 0 80px 40px hsla(40,100%,60%,0.5), 0 0 160px 80px hsla(24,95%,53%,0.25)"
            : "0 0 60px 30px hsla(214,40%,85%,0.35), 0 0 120px 60px hsla(260,30%,60%,0.15)",
          filter: isSun ? "blur(2px)" : "blur(1px)",
        }}
      />

      {/* Rays (sun) or stars (moon) */}
      {isSun ? (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: phase === "enter" ? "-10%" : "18%",
                width: "2px",
                height: phase === "hold" ? "200px" : "80px",
                background: `linear-gradient(180deg, hsla(45,100%,75%,${phase === "hold" ? 0.6 : 0}) 0%, transparent 100%)`,
                transform: `translateX(-50%) rotate(${i * 45}deg)`,
                transformOrigin: "50% 0%",
                transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: phase === "exit" ? 0 : 1,
              }}
            />
          ))}
        </>
      ) : (
        <>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-foreground/80"
              style={{
                width: `${1.5 + Math.random() * 2.5}px`,
                height: `${1.5 + Math.random() * 2.5}px`,
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 90}%`,
                opacity: phase === "enter" ? 0 : phase === "hold" ? 0.4 + Math.random() * 0.5 : 0,
                transition: `opacity ${0.5 + Math.random() * 0.8}s ease ${Math.random() * 0.4}s`,
                boxShadow: "0 0 4px 1px hsla(214, 40%, 85%, 0.4)",
              }}
            />
          ))}
        </>
      )}
    </div>,
    document.body
  );
}

/** Hook to manage the celestial theme transition */
export function useThemeTransition() {
  const [direction, setDirection] = useState<TransitionDirection>(null);

  const trigger = useCallback((dir: "to-sun" | "to-moon") => {
    setDirection(dir);
  }, []);

  const handleComplete = useCallback(() => {
    setDirection(null);
  }, []);

  return { direction, trigger, handleComplete };
}
